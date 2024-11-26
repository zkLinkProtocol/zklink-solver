/**
 * @fileoverview Factory service for creating chain clients
 */
import { Injectable } from '@nestjs/common';
import { Evm } from './evm';
import { ClientInterface } from './client.interface';

@Injectable()
export class ClientService {
  private clients: Map<number, ClientInterface> = new Map();

  constructor() {
    // create clients for all supported chains
    const supportChains = [97, 84532];
    const rpcUrls = [
      'https://endpoints.omniatech.io/v1/bsc/testnet/public',
      'https://base-sepolia.blockpi.network/v1/rpc/public',
    ];
    const contractAddresses = [
      '0xb94474abf18b215281969b8300d3066497f5024d',
      '0x66f4166e79cf480512f8b2178a287d7db0a71efd',
    ];
    if (
      supportChains.length !== rpcUrls.length ||
      supportChains.length !== contractAddresses.length
    ) {
      throw new Error('Invalid configuration for chain clients');
    }

    supportChains.forEach((chainId, index) => {
      this.clients.set(
        chainId,
        new Evm(rpcUrls[index], contractAddresses[index]),
      );
    });
  }

  /** Get client by chain id */
  getClient(chainId: number) {
    return this.clients.get(chainId);
  }

  /** Get all clients */
  getClients() {
    return Array.from(this.clients).map(([, client]) => client);
  }
}
