/**
 * @fileoverview Factory service for creating chain clients
 */
import { Injectable } from '@nestjs/common';
import { Evm } from './evm';
import { ClientInterface } from './client.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientService {
  private clients: Map<number, ClientInterface> = new Map();

  constructor(private readonly configService: ConfigService) {
    // create clients for all supported chains
    const supportChains = this.configService.get('support_chains');

    supportChains.forEach((item) => {
      this.clients.set(
        item.chain_id,
        new Evm(
          item.chain_id,
          item.rpc_url,
          item.contract_address,
          item.start_block_number,
          item.confirm_blocks,
        ),
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
