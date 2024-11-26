import { AbiCoder, keccak256, toUtf8Bytes } from "ethers";
import { AcrossOrderDataStruct } from "../typechain-types/contracts/ZKLinkAcross";
import { V3SpokePoolInterface } from "../typechain-types/contracts/interfaces/V3SpokePoolInterface";

const ACROSS_ORDER_DATA_TYPE =
  "AcrossOrderData(address inputToken,uint256 inputAmount,bytes32 outputToken,uint256 outputAmount,uint32 destinationChainId,bytes32 recipient,bytes32 exclusiveRelayer,uint32 exclusivityPeriod,bytes message)";
export const ACROSS_ORDER_DATA_TYPE_HASH = keccak256(
  toUtf8Bytes(ACROSS_ORDER_DATA_TYPE),
);

export function encodeAcrossOrderData(data: AcrossOrderDataStruct) {
  const abiCoder = AbiCoder.defaultAbiCoder();
  return abiCoder.encode(
    [
      "tuple(address,uint256,bytes32,uint256,uint32,bytes32,bytes32,uint32,bytes)",
    ],
    [
      [
        data.inputToken,
        data.inputAmount,
        data.outputToken,
        data.outputAmount,
        data.destinationChainId,
        data.recipient,
        data.exclusiveRelayer,
        data.exclusivityPeriod,
        data.message,
      ],
    ],
  );
}

export function encodeRelayData(data: V3SpokePoolInterface.V3RelayDataStruct) {
  const abiCoder = AbiCoder.defaultAbiCoder();
  return abiCoder.encode(
    [
      "tuple(bytes32,bytes32,bytes32,bytes32,bytes32,uint256,uint256,uint256,uint32,uint32,uint32,bytes)",
    ],
    [
      [
        data.depositor,
        data.recipient,
        data.exclusiveRelayer,
        data.inputToken,
        data.outputToken,
        data.inputAmount,
        data.outputAmount,
        data.originChainId,
        data.depositId,
        data.fillDeadline,
        data.exclusivityDeadline,
        data.message,
      ],
    ],
  );
}

export function encodeAcrossFillerData(repaymentChainId: string) {
  const abiCoder = AbiCoder.defaultAbiCoder();
  return abiCoder.encode(["tuple(uint256)"], [[repaymentChainId]]);
}

export function encodeAcrossOrderId(
  originData: string,
  destinationChainId: string,
) {
  const abiCoder = AbiCoder.defaultAbiCoder();
  return keccak256(
    abiCoder.encode(["bytes", "uint256"], [originData, destinationChainId]),
  );
}
