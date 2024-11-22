/**
 * @fileoverview Factory service for creating chain clients
 */
import { Injectable } from '@nestjs/common';
import { Ethereum } from './ehtereum';

@Injectable()
export class ClientService {
  private clients: Map<number, any> = new Map();

  constructor() {
    // create clients for all supported chains
    const supportChains = [1];
    const rpcUrls = ['https://eth.drpc.org'];
    if (supportChains.length !== rpcUrls.length) {
      throw new Error('Invalid configuration for chain clients');
    }

    supportChains.forEach((chainId, index) => {
      this.clients.set(chainId, new Ethereum(rpcUrls[index]));
    });
  }

  async getClient(chainId: number) {
    return this.clients.get(chainId);
  }

  getClients() {
    return Array.from(this.clients);
  }
}
