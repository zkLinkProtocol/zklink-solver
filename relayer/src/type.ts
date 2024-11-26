/** 
    /// @title FillInstruction type
    /// @notice Instructions to parameterize each leg of the fill
    /// @dev Provides all the origin-generated information required to produce a valid fill leg
    struct FillInstruction {
        /// @dev The contract address that the order is meant to be settled by
        uint64 destinationChainId;
        /// @dev The contract address that the order is meant to be filled on
        bytes32 destinationSettler;
        /// @dev The data generated on the origin chain needed by the destinationSettler to process the fill
        bytes originData;
    }
    /// @notice Tokens that must be receive for a valid order fulfillment
    struct Output {
        /// @dev The address of the ERC20 token on the destination chain
        /// @dev address(0) used as a sentinel for the native token
        bytes32 token;
        /// @dev The amount of the token to be sent
        uint256 amount;
        /// @dev The address to receive the output tokens
        bytes32 recipient;
        /// @dev The destination chain for this output
        uint256 chainId;
    }
    struct ResolvedCrossChainOrder {
        /// @dev The address of the user who is initiating the transfer
        address user;
        /// @dev The chainId of the origin chain
        uint256 originChainId;
        /// @dev The timestamp by which the order must be opened
        uint32 openDeadline;
        /// @dev The timestamp by which the order must be filled on the destination chain(s)
        uint32 fillDeadline;
        /// @dev The unique identifier for this order within this settlement system
        bytes32 orderId;
        /// @dev The max outputs that the filler will send. It's possible the actual amount depends on the state of the destination
        ///      chain (destination dutch auction, for instance), so these outputs should be considered a cap on filler liabilities.
        Output[] maxSpent;
        /// @dev The minimum outputs that must to be given to the filler as part of order settlement. Similar to maxSpent, it's possible
        ///      that special order types may not be able to guarantee the exact amount at open time, so this should be considered
        ///      a floor on filler receipts.
        Output[] minReceived;
        /// @dev Each instruction in this array is parameterizes a single leg of the fill. This provides the filler with the information
        ///      necessary to perform the fill on the destination(s).
        FillInstruction[] fillInstructions;
    }
    event Open(bytes32 indexed orderId, ResolvedCrossChainOrder resolvedOrder);
 */

type FillInstruction = {
  destinationChainId: number;
  destinationSettler: string;
  originData: string;
};

type Output = {
  token: string;
  amount: string;
  recipient: string;
  chainId: number;
};

type ResolvedCrossChainOrder = {
  user: string;
  originChainId: number;
  openDeadline: number;
  fillDeadline: number;
  orderId: string;
  maxSpent: Output[];
  minReceived: Output[];
  fillInstructions: FillInstruction[];
};

export type Open = {
  orderId: string;
  resolvedOrder: ResolvedCrossChainOrder;
};

/**
 struct AcrossDestinationFillerData {
    uint256 repaymentChainId;
}
 */
export type AcrossDestinationFillerData = {
  repaymentChainId: number;
};

/**
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
 */
export type V3RelayData = {
  depositor: string;
  recipient: string;
  exclusiveRelayer: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  originChainId: number;
  depositId: number;
  fillDeadline: number;
  exclusivityDeadline: number;
  message: string;
};
