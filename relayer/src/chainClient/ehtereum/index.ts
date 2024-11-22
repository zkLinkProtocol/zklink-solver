import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

const WhatchEventHash =
  '0xdaf85957e153de6f91b944f264073d55c4f237c112b06824ea56d57b7f1681d8';
const BatchSize = 2000;

@Injectable()
export class Ethereum implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private contractAddress: string;
  private startBlockNumber: number;

  constructor(rpcUrl: string, contractAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = contractAddress;
  }

  async onModuleInit() {
    this.startBlockNumber = await this.provider.getBlockNumber();
  }

  async watch() {
    let logs: ethers.Log[] = [];

    const latestBlockNumber = await this.provider.getBlockNumber();
    for (
      let fromBlock = this.startBlockNumber;
      fromBlock < latestBlockNumber;
      fromBlock += BatchSize
    ) {
      const toBlock = fromBlock + BatchSize - 1;
      const filter = {
        fromBlock: fromBlock,
        toBlock: Math.min(toBlock, latestBlockNumber),
        address: this.contractAddress,
        topics: [WhatchEventHash],
      };

      const batchLogs = await this.provider.getLogs(filter);
      logs = logs.concat(batchLogs);
    }
    this.startBlockNumber = latestBlockNumber + 1;
    return logs;
  }

  async relay() {}

  private formatEvent(logs: ethers.Log[]) {}
}
