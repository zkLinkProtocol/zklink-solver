import { getAddress, isAddress, isHexString, zeroPadValue } from 'ethers';

export function addressToBytes32(address: string): string {
  if (isHexString(address, 32)) {
    return address;
  }
  if (!isAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  return zeroPadValue(address, 32);
}

export function bytes32ToAddress(bytes32: string): string {
  if (!isHexString(bytes32, 32)) {
    throw new Error('Invalid bytes32 value');
  }
  return getAddress('0x' + bytes32.slice(-40));
}
