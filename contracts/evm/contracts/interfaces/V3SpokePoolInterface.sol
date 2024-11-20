// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

// Contains structs and functions used by SpokePool contracts to facilitate universal settlement.
interface V3SpokePoolInterface {
    /**************************************
     *              ENUMS                 *
     **************************************/

    // Fill status tracks on-chain state of deposit, uniquely identified by relayHash.
    enum FillStatus {
        Unfilled,
        RequestedSlowFill,
        Filled
    }
    // Fill type is emitted in the FilledRelay event to assist Dataworker with determining which types of
    // fills to refund (e.g. only fast fills) and whether a fast fill created a sow fill excess.
    enum FillType {
        FastFill,
        // Fast fills are normal fills that do not replace a slow fill request.
        ReplacedSlowFill,
        // Replaced slow fills are fast fills that replace a slow fill request. This type is used by the Dataworker
        // to know when to send excess funds from the SpokePool to the HubPool because they can no longer be used
        // for a slow fill execution.
        SlowFill
        // Slow fills are requested via requestSlowFill and executed by executeSlowRelayLeaf after a bundle containing
        // the slow fill is validated.
    }

    /**************************************
     *              STRUCTS               *
     **************************************/

    // This struct represents the data to fully specify a **unique** relay submitted on this chain.
    // This data is hashed with the chainId() and saved by the SpokePool to prevent collisions and protect against
    // replay attacks on other chains. If any portion of this data differs, the relay is considered to be
    // completely distinct.
    struct V3RelayData {
        // The address that made the deposit on the origin chain.
        bytes32 depositor;
        // The recipient address on the destination chain.
        bytes32 recipient;
        // This is the exclusive relayer who can fill the deposit before the exclusivity deadline.
        bytes32 exclusiveRelayer;
        // Token that is deposited on origin chain by depositor.
        bytes32 inputToken;
        // Token that is received on destination chain by recipient.
        bytes32 outputToken;
        // The amount of input token deposited by depositor.
        uint256 inputAmount;
        // The amount of output token to be received by recipient.
        uint256 outputAmount;
        // Origin chain id.
        uint256 originChainId;
        // The id uniquely identifying this deposit on the origin chain.
        uint32 depositId;
        // The timestamp on the destination chain after which this deposit can no longer be filled.
        uint32 fillDeadline;
        // The timestamp on the destination chain after which any relayer can fill the deposit.
        uint32 exclusivityDeadline;
        // Data that is forwarded to the recipient.
        bytes message;
    }

    // Contains information about a relay to be sent along with additional information that is not unique to the
    // relay itself but is required to know how to process the relay. For example, "updatedX" fields can be used
    // by the relayer to modify fields of the relay with the depositor's permission, and "repaymentChainId" is specified
    // by the relayer to determine where to take a relayer refund, but doesn't affect the uniqueness of the relay.
    struct V3RelayExecutionParams {
        V3RelayData relay;
        bytes32 relayHash;
        uint256 updatedOutputAmount;
        address updatedRecipient;
        bytes updatedMessage;
        uint256 repaymentChainId;
    }

    // Packs together parameters emitted in FilledV3Relay because there are too many emitted otherwise.
    // Similar to V3RelayExecutionParams, these parameters are not used to uniquely identify the deposit being
    // filled so they don't have to be unpacked by all clients.
    struct V3RelayExecutionEventInfo {
        address updatedRecipient;
        bytes updatedMessage;
        uint256 updatedOutputAmount;
        FillType fillType;
    }

    /**************************************
     *              EVENTS                *
     **************************************/

    event V3FundsDeposited(
        address inputToken,
        bytes32 outputToken,
        uint256 inputAmount,
        uint256 outputAmount,
        uint256 indexed destinationChainId,
        uint32 indexed depositId,
        uint32 quoteTimestamp,
        uint32 fillDeadline,
        uint32 exclusivityDeadline,
        address indexed depositor,
        bytes32 recipient,
        bytes32 exclusiveRelayer,
        bytes message
    );

    event FilledV3Relay(
        bytes32 inputToken,
        address outputToken,
        uint256 inputAmount,
        uint256 outputAmount,
        uint256 repaymentChainId,
        uint256 indexed originChainId,
        uint32 indexed depositId,
        uint32 fillDeadline,
        uint32 exclusivityDeadline,
        address exclusiveRelayer,
        address indexed relayer,
        bytes32 depositor,
        address recipient,
        bytes message,
        V3RelayExecutionEventInfo relayExecutionInfo
    );

    /**************************************
     *              FUNCTIONS             *
     **************************************/

    function depositV3(
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
        uint32 exclusivityDeadline,
        bytes calldata message
    ) external payable;

    function fillV3Relay(
        V3RelayData calldata relayData,
        uint256 repaymentChainId
    ) external;
    /**************************************
     *              ERRORS                *
     **************************************/

    error DisabledRoute();
    error InvalidQuoteTimestamp();
    error InvalidFillDeadline();
    error MsgValueDoesNotMatchInputAmount();
    error NotExclusiveRelayer();
    error RelayFilled();
    error ExpiredFillDeadline();
    error WrongERC7683OrderId();
    error LowLevelCallFailed(bytes data);
}
