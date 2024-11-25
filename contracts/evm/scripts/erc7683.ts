import { AbiCoder, keccak256, toUtf8Bytes } from "ethers";
import { AcrossOrderDataStruct } from "../typechain-types/contracts/ZKLinkAcross";

const ACROSS_ORDER_DATA_TYPE =
  "AcrossOrderData(address inputToken,uint256 inputAmount,bytes32 outputToken,uint256 outputAmount,uint32 destinationChainId,bytes32 recipient,bytes32 exclusiveRelayer,uint32 exclusivityPeriod,bytes message)";
export const ACROSS_ORDER_DATA_TYPE_HASH = keccak256(
  toUtf8Bytes(ACROSS_ORDER_DATA_TYPE),
);

export function encodeAcrossOrderData(data: AcrossOrderDataStruct) {
  const abiCoder = AbiCoder.defaultAbiCoder();
  return abiCoder.encode(
    [
      "address",
      "uint256",
      "bytes32",
      "uint256",
      "uint32",
      "bytes32",
      "bytes32",
      "uint32",
      "bytes",
    ],
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
  );
}
