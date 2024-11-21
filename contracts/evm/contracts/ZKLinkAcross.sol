// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./external/interfaces/IPermit2.sol";
import "./external/interfaces/WETH9Interface.sol";
import "./interfaces/V3SpokePoolInterface.sol";
import "./erc7683/ERC7683.sol";
import "./erc7683/ERC7683Across.sol";
import "./upgradeable/AddressLibUpgradeable.sol";
import "./interfaces/SpokePoolMessageHandler.sol";

contract ZKLinkAcross is
    Initializable,
    UUPSUpgradeable,
    AccessControlEnumerableUpgradeable,
    ReentrancyGuardUpgradeable,
    IOriginSettler,
    IDestinationSettler
{
    using SafeERC20 for IERC20;
    using AddressLibUpgradeable for address;

    error WrongSettlementContract();
    error WrongChainId();
    error WrongOrderDataType();
    error WrongExclusiveRelayer();

    bytes32 public constant FILLER_ROLE = keccak256("FILLER_ROLE");

    // Permit2 contract for this network.
    IPermit2 public immutable PERMIT2;

    // Any deposit quote times greater than or less than this value to the current contract time is blocked. Forces
    // caller to use an approximately "current" realized fee.
    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    uint32 public immutable depositQuoteTimeBuffer;

    // The fill deadline can only be set this far into the future from the timestamp of the deposit on this contract.
    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    uint32 public immutable fillDeadlineBuffer;

    // Count of deposits is used to construct a unique deposit identifier for this spoke pool.
    uint32 public numberOfDeposits;

    // Mapping of chainIds to destination settler addresses.
    mapping(uint256 => bytes32) public destinationSettlers;

    // Origin token to destination token routings can be turned on or off, which can enable or disable deposits.
    mapping(address => mapping(uint256 => bool)) public enabledDepositRoutes;

    // Mapping of V3 relay hashes to fill statuses. Distinguished from relayFills
    // to eliminate any chance of collision between pre and post V3 relay hashes.
    mapping(bytes32 => uint256) public fillStatuses;

    // Reserve storage slots for future versions of this base contract to add state variables without
    // affecting the storage layout of child contracts. Decrement the size of __gap whenever state variables
    // are added. This is at bottom of contract to make sure it's always at the end of storage.
    uint256[999] private __gap;

    event SetDestinationSettler(
        uint256 indexed chainId,
        bytes32 indexed prevDestinationSettler,
        bytes32 indexed destinationSettler
    );

    event EnabledDepositRoute(address indexed originToken, uint256 indexed destinationChainId, bool enabled);

    constructor(IPermit2 _permit2, uint32 _depositQuoteTimeBuffer, uint32 _fillDeadlineBuffer) {
        PERMIT2 = _permit2;
        depositQuoteTimeBuffer = _depositQuoteTimeBuffer;
        fillDeadlineBuffer = _fillDeadlineBuffer;

        _disableInitializers();
    }

    function initialize(address _owner) public initializer {
        __UUPSUpgradeable_init_unchained();
        __AccessControl_init_unchained();
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function setDestinationSettler(uint256 destChainId, bytes32 destinationSettler) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 prevDestinationSettler = destinationSettlers[destChainId];
        destinationSettlers[destChainId] = destinationSettler;
        emit SetDestinationSettler(destChainId, prevDestinationSettler, destinationSettler);
    }

    function setEnableRoute(
        address originToken,
        uint256 destinationChainId,
        bool enabled
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        enabledDepositRoutes[originToken][destinationChainId] = enabled;
        emit EnabledDepositRoute(originToken, destinationChainId, enabled);
    }

    /**
     * @notice Open the order on behalf of the user.
     * @dev This will pull in the user's funds and make the order available to be filled.
     * @param order the ERC7683 compliant order.
     * @param signature signature for the EIP-712 compliant order type.
     * @param fillerData Across-specific fillerData.
     */
    function openFor(
        GaslessCrossChainOrder calldata order,
        bytes calldata signature,
        bytes calldata fillerData
    ) external nonReentrant {
        (
            ResolvedCrossChainOrder memory resolvedOrder,
            AcrossOrderData memory acrossOrderData,
            AcrossOriginFillerData memory acrossOriginFillerData
        ) = _resolveFor(order, fillerData);

        // Verify Permit2 signature and pull user funds into this contract
        _processPermit2Order(order, acrossOrderData, signature);

        _callDeposit(
            order.user,
            acrossOrderData.recipient,
            acrossOrderData.inputToken,
            acrossOrderData.outputToken,
            acrossOrderData.inputAmount,
            acrossOrderData.outputAmount,
            acrossOrderData.destinationChainId,
            acrossOriginFillerData.exclusiveRelayer,
            // Note: simplifying assumption to avoid quote timestamps that cause orders to expire before the deadline.
            SafeCast.toUint32(order.openDeadline - depositQuoteTimeBuffer),
            order.fillDeadline,
            acrossOrderData.exclusivityPeriod,
            acrossOrderData.message
        );

        emit Open(keccak256(resolvedOrder.fillInstructions[0].originData), resolvedOrder);
    }

    /**
     * @notice Opens the order.
     * @dev Unlike openFor, this method is callable by the user.
     * @dev This will pull in the user's funds and make the order available to be filled.
     * @param order the ERC7683 compliant order.
     */
    function open(OnchainCrossChainOrder calldata order) external nonReentrant {
        (ResolvedCrossChainOrder memory resolvedOrder, AcrossOrderData memory acrossOrderData) = _resolve(order);

        IERC20(acrossOrderData.inputToken).safeTransferFrom(msg.sender, address(this), acrossOrderData.inputAmount);

        _callDeposit(msg.sender,
            acrossOrderData.recipient,
            acrossOrderData.inputToken,
            acrossOrderData.outputToken,
            acrossOrderData.inputAmount,
            acrossOrderData.outputAmount,
            acrossOrderData.destinationChainId,
            acrossOrderData.exclusiveRelayer,
            // Note: simplifying assumption to avoid the order type having to bake in the quote timestamp.
            SafeCast.toUint32(block.timestamp),
            order.fillDeadline,
            acrossOrderData.exclusivityPeriod,
            acrossOrderData.message);

        emit Open(keccak256(resolvedOrder.fillInstructions[0].originData), resolvedOrder);
    }

    /**
     * @notice Constructs a ResolvedOrder from a GaslessCrossChainOrder and originFillerData.
     * @param order the ERC-7683 compliant order.
     * @param originFillerData Across-specific fillerData.
     */
    function resolveFor(GaslessCrossChainOrder calldata order, bytes calldata originFillerData)
    external
    view
    returns (ResolvedCrossChainOrder memory resolvedOrder)
    {
        (resolvedOrder, , ) = _resolveFor(order, originFillerData);
    }

    /**
     * @notice Constructs a ResolvedOrder from a CrossChainOrder.
     * @param order the ERC7683 compliant order.
     */
    function resolve(OnchainCrossChainOrder calldata order)
    external
    view
    returns (ResolvedCrossChainOrder memory resolvedOrder)
    {
        (resolvedOrder, ) = _resolve(order);
    }

    /**
     * @notice Fills a single leg of a particular order on the destination chain
     * @dev ERC-7683 fill function.
     * @param orderId Unique order identifier for this order
     * @param originData Data emitted on the origin to parameterize the fill
     * @param fillerData Data provided by the filler to inform the fill or express their preferences
     */
    function fill(
        bytes32 orderId,
        bytes calldata originData,
        bytes calldata fillerData
    ) external nonReentrant onlyRole(FILLER_ROLE) {
        if (keccak256(abi.encode(originData, chainId())) != orderId) {
            revert V3SpokePoolInterface.WrongERC7683OrderId();
        }

        // Ensure that the call is not malformed. If the call is malformed, abi.decode will fail.
        V3SpokePoolInterface.V3RelayData memory relayData = abi.decode(originData, (V3SpokePoolInterface.V3RelayData));
        AcrossDestinationFillerData memory destinationFillerData = abi.decode(
            fillerData,
            (AcrossDestinationFillerData)
        );

        _fillV3Relay(relayData, destinationFillerData.repaymentChainId);
    }

    /**
     * @notice Previously, this function allowed the caller to specify the exclusivityDeadline, otherwise known as the
     * as exact timestamp on the destination chain before which only the exclusiveRelayer could fill the deposit. Now,
     * the caller is expected to pass in an exclusivityPeriod which is the number of seconds to be added to the
     * block.timestamp to produce the exclusivityDeadline. This allows the caller to ignore any latency associated
     * with this transaction being mined and propagating this transaction to the miner.
     * @notice Request to bridge input token cross chain to a destination chain and receive a specified amount
     * of output tokens. The fee paid to relayers and the system should be captured in the spread between output
     * amount and input amount when adjusted to be denominated in the input token. A relayer on the destination
     * chain will send outputAmount of outputTokens to the recipient and receive inputTokens on a repayment
     * chain of their choice. Therefore, the fee should account for destination fee transaction costs,
     * the relayer's opportunity cost of capital while they wait to be refunded following an optimistic challenge
     * window in the HubPool, and the system fee that they'll be charged.
     * @dev On the destination chain, the hash of the deposit data will be used to uniquely identify this deposit, so
     * modifying any params in it will result in a different hash and a different deposit. The hash will comprise
     * all parameters to this function along with this chain's chainId(). Relayers are only refunded for filling
     * deposits with deposit hashes that map exactly to the one emitted by this contract.
     * @param depositor The account credited with the deposit who can request to "speed up" this deposit by modifying
     * the output amount, recipient, and message.
     * @param recipient The account receiving funds on the destination chain. Can be an EOA or a contract. If
     * the output token is the wrapped native token for the chain, then the recipient will receive native token if
     * an EOA or wrapped native token if a contract.
     * @param inputToken The token pulled from the caller's account and locked into this contract to
     * initiate the deposit. The equivalent of this token on the relayer's repayment chain of choice will be sent
     * as a refund. If this is equal to the wrapped native token then the caller can optionally pass in native token as
     * msg.value, as long as msg.value = inputTokenAmount.
     * @param outputToken The token that the relayer will send to the recipient on the destination chain. Must be an
     * ERC20.
     * @param inputAmount The amount of input tokens to pull from the caller's account and lock into this contract.
     * This amount will be sent to the relayer on their repayment chain of choice as a refund following an optimistic
     * challenge window in the HubPool, less a system fee.
     * @param outputAmount The amount of output tokens that the relayer will send to the recipient on the destination.
     * @param destinationChainId The destination chain identifier. Must be enabled along with the input token
     * as a valid deposit route from this spoke pool or this transaction will revert.
     * @param exclusiveRelayer The relayer that will be exclusively allowed to fill this deposit before the
     * exclusivity deadline timestamp. This must be a valid, non-zero address if the exclusivity deadline is
     * greater than the current block.timestamp. If the exclusivity deadline is < currentTime, then this must be
     * address(0), and vice versa if this is address(0).
     * @param quoteTimestamp The HubPool timestamp that is used to determine the system fee paid by the depositor.
     *  This must be set to some time between [currentTime - depositQuoteTimeBuffer, currentTime]
     * where currentTime is block.timestamp on this chain or this transaction will revert.
     * @param fillDeadline The deadline for the relayer to fill the deposit. After this destination chain timestamp,
     * the fill will revert on the destination chain. Must be set between [currentTime, currentTime + fillDeadlineBuffer]
     * where currentTime is block.timestamp on this chain or this transaction will revert.
     * @param exclusivityPeriod Added to the current time to set the exclusive relayer deadline,
     * which is the deadline for the exclusiveRelayer to fill the deposit. After this destination chain timestamp,
     * anyone can fill the deposit.
     * @param message The message to send to the recipient on the destination chain if the recipient is a contract.
     * If the message is not empty, the recipient contract must implement handleV3AcrossMessage() or the fill will revert.
     */
    function _callDeposit(
        address depositor,
        bytes32 recipient,
        address inputToken,
        bytes32 outputToken,
        uint256 inputAmount,
        uint256 outputAmount,
        uint256 destinationChainId,
        bytes32 exclusiveRelayer,
        uint32 quoteTimestamp,
        uint32 fillDeadline,
        uint32 exclusivityPeriod,
        bytes memory message
    ) internal {
        // Check that deposit route is enabled for the input token. There are no checks required for the output token
        // which is pulled from the relayer at fill time and passed through this contract atomically to the recipient.
        if (!enabledDepositRoutes[inputToken][destinationChainId]) revert V3SpokePoolInterface.DisabledRoute();

        // Require that quoteTimestamp has a maximum age so that depositors pay an LP fee based on recent HubPool usage.
        // It is assumed that cross-chain timestamps are normally loosely in-sync, but clock drift can occur. If the
        // SpokePool time stalls or lags significantly, it is still possible to make deposits by setting quoteTimestamp
        // within the configured buffer. The owner should pause deposits/fills if this is undesirable.
        // This will underflow if quoteTimestamp is more than depositQuoteTimeBuffer;
        // this is safe but will throw an unintuitive error.

        // slither-disable-next-line timestamp
        uint256 currentTime = getCurrentTime();
        if (currentTime - quoteTimestamp > depositQuoteTimeBuffer) revert V3SpokePoolInterface.InvalidQuoteTimestamp();

        // fillDeadline is relative to the destination chain.
        // Don’t allow fillDeadline to be more than several bundles into the future.
        // This limits the maximum required lookback for dataworker and relayer instances.
        // Also, don't allow fillDeadline to be in the past. This poses a potential UX issue if the destination
        // chain time keeping and this chain's time keeping are out of sync but is not really a practical hurdle
        // unless they are significantly out of sync or the depositor is setting very short fill deadlines. This latter
        // situation won't be a problem for honest users.
        if (fillDeadline < currentTime || fillDeadline > currentTime + fillDeadlineBuffer) revert V3SpokePoolInterface.InvalidFillDeadline();

        emit V3SpokePoolInterface.V3FundsDeposited(
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            destinationChainId,
            // Increment count of deposits so that deposit ID for this spoke pool is unique.
            numberOfDeposits++,
            quoteTimestamp,
            fillDeadline,
            uint32(currentTime) + exclusivityPeriod,
            depositor,
            recipient,
            exclusiveRelayer,
            message
        );
    }

    /**
     * @notice Fulfill request to bridge cross chain by sending specified output tokens to the recipient.
     * @dev The fee paid to relayers and the system should be captured in the spread between output
     * amount and input amount when adjusted to be denominated in the input token. A relayer on the destination
     * chain will send outputAmount of outputTokens to the recipient and receive inputTokens on a repayment
     * chain of their choice. Therefore, the fee should account for destination fee transaction costs, the
     * relayer's opportunity cost of capital while they wait to be refunded following an optimistic challenge
     * window in the HubPool, and a system fee charged to relayers.
     * @dev The hash of the relayData will be used to uniquely identify the deposit to fill, so
     * modifying any params in it will result in a different hash and a different deposit. The hash will comprise
     * all parameters passed to depositV3() on the origin chain along with that chain's chainId(). This chain's
     * chainId() must therefore match the destinationChainId passed into depositV3.
     * Relayers are only refunded for filling deposits with deposit hashes that map exactly to the one emitted by the
     * origin SpokePool therefore the relayer should not modify any params in relayData.
     * @dev Cannot fill more than once. Partial fills are not supported.
     * @param relayData struct containing all the data needed to identify the deposit to be filled. Should match
     * all the same-named parameters emitted in the origin chain V3FundsDeposited event.
     * - depositor: The account credited with the deposit who can request to "speed up" this deposit by modifying
     * the output amount, recipient, and message.
     * - recipient The account receiving funds on this chain. Can be an EOA or a contract. If
     * the output token is the wrapped native token for the chain, then the recipient will receive native token if
     * an EOA or wrapped native token if a contract.
     * - inputToken: The token pulled from the caller's account to initiate the deposit. The equivalent of this
     * token on the repayment chain will be sent as a refund to the caller.
     * - outputToken The token that the caller will send to the recipient on the destination chain. Must be an
     * ERC20.
     * - inputAmount: This amount, less a system fee, will be sent to the caller on their repayment chain of choice as a refund
     * following an optimistic challenge window in the HubPool.
     * - outputAmount: The amount of output tokens that the caller will send to the recipient.
     * - originChainId: The origin chain identifier.
     * - exclusiveRelayer The relayer that will be exclusively allowed to fill this deposit before the
     * exclusivity deadline timestamp.
     * - fillDeadline The deadline for the caller to fill the deposit. After this timestamp,
     * the fill will revert on the destination chain.
     * - exclusivityDeadline: The deadline for the exclusive relayer to fill the deposit. After this
     * timestamp, anyone can fill this deposit.
     * - message The message to send to the recipient if the recipient is a contract that implements a
     * handleV3AcrossMessage() public function
     * @param repaymentChainId Chain of SpokePool where relayer wants to be refunded after the challenge window has
     * passed. Will receive inputAmount of the equivalent token to inputToken on the repayment chain.
     */
    function _fillV3Relay(V3SpokePoolInterface.V3RelayData memory relayData, uint256 repaymentChainId)
    internal
    {
        address exclusiveRelayer = _bytes32ToAddress(relayData.exclusiveRelayer);
        // Exclusivity deadline is inclusive and is the latest timestamp that the exclusive relayer has sole right
        // to fill the relay.
        if (
            _fillIsExclusive(exclusiveRelayer, relayData.exclusivityDeadline, uint32(getCurrentTime())) &&
            exclusiveRelayer != msg.sender
        ) {
            revert V3SpokePoolInterface.NotExclusiveRelayer();
        }

        V3SpokePoolInterface.V3RelayExecutionParams memory relayExecution = V3SpokePoolInterface.V3RelayExecutionParams({
            relay: relayData,
            relayHash: _getV3RelayHash(relayData),
            updatedOutputAmount: relayData.outputAmount,
            updatedRecipient: _bytes32ToAddress(relayData.recipient),
            updatedMessage: relayData.message,
            repaymentChainId: repaymentChainId
        });

        _fillRelayV3(relayExecution, msg.sender);
    }

    /**
     * @notice Decodes the Across specific orderData and fillerData into descriptive types.
     * @param orderData the orderData field of the ERC7683 compliant order.
     * @param fillerData Across-specific fillerData.
     * @return acrossOrderData decoded AcrossOrderData.
     * @return acrossOriginFillerData decoded AcrossOriginFillerData.
     */
    function decode(bytes memory orderData, bytes memory fillerData)
    public
    pure
    returns (AcrossOrderData memory, AcrossOriginFillerData memory)
    {
        return (abi.decode(orderData, (AcrossOrderData)), abi.decode(fillerData, (AcrossOriginFillerData)));
    }

    /**
     * @notice Gets the current time.
     * @return uint for the current timestamp.
     */
    function getCurrentTime() public view virtual returns (uint32) {
        return SafeCast.toUint32(block.timestamp); // solhint-disable-line not-rely-on-time
    }

    function _resolveFor(GaslessCrossChainOrder calldata order, bytes calldata fillerData)
    internal
    view
    returns (
        ResolvedCrossChainOrder memory resolvedOrder,
        AcrossOrderData memory acrossOrderData,
        AcrossOriginFillerData memory acrossOriginFillerData
    )
    {
        // Ensure that order was intended to be settled by Across.
        if (order.originSettler != address(this)) {
            revert WrongSettlementContract();
        }

        if (order.originChainId != block.chainid) {
            revert WrongChainId();
        }

        if (order.orderDataType != ACROSS_ORDER_DATA_TYPE_HASH) {
            revert WrongOrderDataType();
        }

        // Extract Across-specific params.
        (acrossOrderData, acrossOriginFillerData) = decode(order.orderData, fillerData);

        if (
            acrossOrderData.exclusiveRelayer != bytes32(0) &&
            acrossOrderData.exclusiveRelayer != acrossOriginFillerData.exclusiveRelayer
        ) {
            revert WrongExclusiveRelayer();
        }

        Output[] memory maxSpent = new Output[](1);
        maxSpent[0] = Output({
            token: acrossOrderData.outputToken,
            amount: acrossOrderData.outputAmount,
            recipient: acrossOrderData.recipient,
            chainId: acrossOrderData.destinationChainId
        });

        // We assume that filler takes repayment on the origin chain in which case the filler output
        // will always be equal to the input amount. If the filler requests repayment somewhere else then
        // the filler output will be equal to the input amount less a fee based on the chain they request
        // repayment on.
        Output[] memory minReceived = new Output[](1);
        minReceived[0] = Output({
            token: _toBytes32(acrossOrderData.inputToken),
            amount: acrossOrderData.inputAmount,
            recipient: acrossOriginFillerData.exclusiveRelayer,
            chainId: block.chainid
        });

        FillInstruction[] memory fillInstructions = new FillInstruction[](1);
        V3SpokePoolInterface.V3RelayData memory relayData;
        relayData.depositor = _addressToBytes32(order.user);
        relayData.recipient = acrossOrderData.recipient;
        relayData.exclusiveRelayer = acrossOriginFillerData.exclusiveRelayer;
        relayData.inputToken = _addressToBytes32(acrossOrderData.inputToken);
        relayData.outputToken = acrossOrderData.outputToken;
        relayData.inputAmount = acrossOrderData.inputAmount;
        relayData.outputAmount = acrossOrderData.outputAmount;
        relayData.originChainId = block.chainid;
        relayData.depositId = _currentDepositId();
        relayData.fillDeadline = order.fillDeadline;
        relayData.exclusivityDeadline = acrossOrderData.exclusivityPeriod;
        relayData.message = acrossOrderData.message;
        fillInstructions[0] = FillInstruction({
            destinationChainId: acrossOrderData.destinationChainId,
            destinationSettler: _destinationSettler(acrossOrderData.destinationChainId),
            originData: abi.encode(relayData)
        });

        resolvedOrder = ResolvedCrossChainOrder({
            user: order.user,
            originChainId: order.originChainId,
            openDeadline: order.openDeadline,
            fillDeadline: order.fillDeadline,
            minReceived: minReceived,
            maxSpent: maxSpent,
            fillInstructions: fillInstructions,
            orderId: keccak256(abi.encode(relayData, acrossOrderData.destinationChainId))
        });
    }

    function _resolve(OnchainCrossChainOrder calldata order)
    internal
    view
    returns (ResolvedCrossChainOrder memory resolvedOrder, AcrossOrderData memory acrossOrderData)
    {
        if (order.orderDataType != ACROSS_ORDER_DATA_TYPE_HASH) {
            revert WrongOrderDataType();
        }

        // Extract Across-specific params.
        acrossOrderData = abi.decode(order.orderData, (AcrossOrderData));

        Output[] memory maxSpent = new Output[](1);
        maxSpent[0] = Output({
            token: acrossOrderData.outputToken,
            amount: acrossOrderData.outputAmount,
            recipient: acrossOrderData.recipient,
            chainId: acrossOrderData.destinationChainId
        });

        // We assume that filler takes repayment on the origin chain in which case the filler output
        // will always be equal to the input amount. If the filler requests repayment somewhere else then
        // the filler output will be equal to the input amount less a fee based on the chain they request
        // repayment on.
        Output[] memory minReceived = new Output[](1);
        minReceived[0] = Output({
            token: _toBytes32(acrossOrderData.inputToken),
            amount: acrossOrderData.inputAmount,
            recipient: acrossOrderData.exclusiveRelayer,
            chainId: block.chainid
        });

        FillInstruction[] memory fillInstructions = new FillInstruction[](1);
        V3SpokePoolInterface.V3RelayData memory relayData;
        relayData.depositor = _addressToBytes32(msg.sender);
        relayData.recipient = acrossOrderData.recipient;
        relayData.exclusiveRelayer = acrossOrderData.exclusiveRelayer;
        relayData.inputToken = _addressToBytes32(acrossOrderData.inputToken);
        relayData.outputToken = acrossOrderData.outputToken;
        relayData.inputAmount = acrossOrderData.inputAmount;
        relayData.outputAmount = acrossOrderData.outputAmount;
        relayData.originChainId = block.chainid;
        relayData.depositId = _currentDepositId();
        relayData.fillDeadline = order.fillDeadline;
        relayData.exclusivityDeadline = acrossOrderData.exclusivityPeriod;
        relayData.message = acrossOrderData.message;
        fillInstructions[0] = FillInstruction({
            destinationChainId: acrossOrderData.destinationChainId,
            destinationSettler: _destinationSettler(acrossOrderData.destinationChainId),
            originData: abi.encode(relayData)
        });

        resolvedOrder = ResolvedCrossChainOrder({
            user: msg.sender,
            originChainId: SafeCast.toUint64(block.chainid),
            openDeadline: type(uint32).max, // no deadline since the user is sending it
            fillDeadline: order.fillDeadline,
            minReceived: minReceived,
            maxSpent: maxSpent,
            fillInstructions: fillInstructions,
            orderId: keccak256(abi.encode(relayData, acrossOrderData.destinationChainId))
        });
    }

    function _processPermit2Order(
        GaslessCrossChainOrder memory order,
        AcrossOrderData memory acrossOrderData,
        bytes memory signature
    ) internal {
        IPermit2.PermitTransferFrom memory permit = IPermit2.PermitTransferFrom({
            permitted: IPermit2.TokenPermissions({
            token: acrossOrderData.inputToken,
            amount: acrossOrderData.inputAmount
        }),
            nonce: order.nonce,
            deadline: order.openDeadline
        });

        IPermit2.SignatureTransferDetails memory signatureTransferDetails = IPermit2.SignatureTransferDetails({
            to: address(this),
            requestedAmount: acrossOrderData.inputAmount
        });

        // Pull user funds.
        PERMIT2.permitWitnessTransferFrom(
            permit,
            signatureTransferDetails,
            order.user,
            ERC7683Permit2Lib.hashOrder(order, ERC7683Permit2Lib.hashOrderData(acrossOrderData)), // witness data hash
            ERC7683Permit2Lib.PERMIT2_ORDER_TYPE, // witness data type string
            signature
        );
    }

    function _toBytes32(address input) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(input)));
    }

    function _currentDepositId() internal view returns (uint32) {
        return numberOfDeposits;
    }

    function _destinationSettler(uint256 destChainId) internal view returns (bytes32) {
        return destinationSettlers[destChainId];
    }

    // Determine whether the combination of exlcusiveRelayer and exclusivityDeadline implies active exclusivity.
    function _fillIsExclusive(
        address exclusiveRelayer,
        uint32 exclusivityDeadline,
        uint32 currentTime
    ) internal pure returns (bool) {
        return exclusivityDeadline >= currentTime && exclusiveRelayer != address(0);
    }

    // @param relayer: relayer who is actually credited as filling this deposit. Can be different from
    // exclusiveRelayer if passed exclusivityDeadline or if slow fill.
    function _fillRelayV3(
        V3SpokePoolInterface.V3RelayExecutionParams memory relayExecution,
        address relayer
    ) internal {
        V3SpokePoolInterface.V3RelayData memory relayData = relayExecution.relay;

        if (relayData.fillDeadline < getCurrentTime()) revert V3SpokePoolInterface.ExpiredFillDeadline();

        bytes32 relayHash = relayExecution.relayHash;

        // If a slow fill for this fill was requested then the relayFills value for this hash will be
        // FillStatus.RequestedSlowFill. Therefore, if this is the status, then this fast fill
        // will be replacing the slow fill. If this is a slow fill execution, then the following variable
        // is trivially true. We'll emit this value in the FilledV3Relay
        // event to assist the Dataworker in knowing when to return funds back to the HubPool that can no longer
        // be used for a slow fill execution.
        V3SpokePoolInterface.FillType fillType = // The following is true if this is a fast fill that was sent after a slow fill request.
            fillStatuses[relayExecution.relayHash] == uint256(V3SpokePoolInterface.FillStatus.RequestedSlowFill)
                ? V3SpokePoolInterface.FillType.ReplacedSlowFill
                : V3SpokePoolInterface.FillType.FastFill;

        // @dev This function doesn't support partial fills. Therefore, we associate the relay hash with
        // an enum tracking its fill status. All filled relays, whether slow or fast fills, are set to the Filled
        // status. However, we also use this slot to track whether this fill had a slow fill requested. Therefore
        // we can include a bool in the FilledV3Relay event making it easy for the dataworker to compute if this
        // fill was a fast fill that replaced a slow fill and therefore this SpokePool has excess funds that it
        // needs to send back to the HubPool.
        if (fillStatuses[relayHash] == uint256(V3SpokePoolInterface.FillStatus.Filled)) revert V3SpokePoolInterface.RelayFilled();
        fillStatuses[relayHash] = uint256(V3SpokePoolInterface.FillStatus.Filled);

        // @dev Before returning early, emit events to assist the dataworker in being able to know which fills were
        // successful.
        emit V3SpokePoolInterface.FilledV3Relay(
            relayData.inputToken,
            _bytes32ToAddress(relayData.outputToken),
            relayData.inputAmount,
            relayData.outputAmount,
            relayExecution.repaymentChainId,
            relayData.originChainId,
            relayData.depositId,
            relayData.fillDeadline,
            relayData.exclusivityDeadline,
            _bytes32ToAddress(relayData.exclusiveRelayer),
            relayer,
            relayData.depositor,
            _bytes32ToAddress(relayData.recipient),
            relayData.message,
            V3SpokePoolInterface.V3RelayExecutionEventInfo({
                updatedRecipient: relayExecution.updatedRecipient,
                updatedMessage: relayExecution.updatedMessage,
                updatedOutputAmount: relayExecution.updatedOutputAmount,
                fillType: fillType
            })
        );

        // If relayer and receiver are the same address, there is no need to do any transfer, as it would result in no
        // net movement of funds.
        // Note: this is important because it means that relayers can intentionally self-relay in a capital efficient
        // way (no need to have funds on the destination).
        // If this is a slow fill, we can't exit early since we still need to send funds out of this contract
        // since there is no "relayer".
        address recipientToSend = relayExecution.updatedRecipient;
        // If relay token is wrappedNativeToken then unwrap and send native token.
        address outputToken = _bytes32ToAddress(relayData.outputToken);
        uint256 amountToSend = relayExecution.updatedOutputAmount;
        // Note: Similar to note above, send token directly from the contract to the user in the slow relay case.
        IERC20(outputToken).safeTransfer(recipientToSend, amountToSend);
    }

    /**
     * @notice Returns chain ID for this network.
     * @dev Some L2s like ZKSync don't support the CHAIN_ID opcode so we allow the implementer to override this.
     */
    function chainId() public view returns (uint256) {
        return block.chainid;
    }

    function _getV3RelayHash(V3SpokePoolInterface.V3RelayData memory relayData) private view returns (bytes32) {
        return keccak256(abi.encode(relayData, chainId()));
    }

    function _bytes32ToAddress(bytes32 input) internal pure returns (address) {
        return address(uint160(uint256(input)));
    }

    function _addressToBytes32(address input) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(input)));
    }
}
