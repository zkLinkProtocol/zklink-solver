import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { AcrossDestinationFillerData, Open, V3RelayData } from '../../type';
import { zklinkAcrossChainAbi } from './zklinkAcross.abi.json';
import { ClientInterface } from '../client.interface';

const OpenEventHash =
  '0xdaf85957e153de6f91b944f264073d55c4f237c112b06824ea56d57b7f1681d8';
const BatchSize = 2000;

@Injectable()
export class Evm implements OnModuleInit, ClientInterface {
  private readonly logger = new Logger('Evm');
  private readonly filler: ethers.Wallet;
  private readonly contractAddress: string;
  private readonly provider: ethers.JsonRpcProvider;
  private contractWithSigner;
  private startBlockNumber: number;

  constructor(rpcUrl: string, contractAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = contractAddress;
    const privateKey =
      '0xec6a8c6b8afb4b1faba6a27b2b992b66afe66f12596505c735ea9ed1e7349a16';
    this.filler = new ethers.Wallet(privateKey, this.provider);
    const contract = new ethers.Contract(
      contractAddress,
      zklinkAcrossChainAbi,
      this.provider,
    );
    this.contractWithSigner = contract.connect(this.filler);
  }

  async onModuleInit() {
    this.startBlockNumber = await this.provider.getBlockNumber();
  }

  /**
   * @dev Watch the Open event from the contract
   * @returns  The Open event
   * */
  async watch(): Promise<Open[]> {
    const logs = await this.fetchOpenLogs();
    return this.formatOpenEvent(logs);
  }

  /**
   * @dev Fill the Open event to the destination chain
   * @param orders  The Open event
   * */
  async fill(orders: Open[]) {
    // Call contract function
    const res = [];
    for (const order of orders) {
      try {
        res.push(await this.fillSingle(order));
      } catch (error) {
        this.logger.error(
          `Fill order failed, error message:${error.message}, error:${error.stack}`,
        );
      }
    }
  }

  /**
   * @dev Fill the Open event to the destination chain
   * @param order  The Open event
   * @returns  The transaction hash
   * */
  async fillSingle(order: Open): Promise<string> {
    const fillData = this.OpenToFillData(order);
    let gasEstimate = 0;
    try {
      gasEstimate = await this.contractWithSigner.fill.estimateGas(
        fillData.v3RelayData,
        fillData.acrossDestinationFillerData,
      );
    } catch (error) {
      this.logger.error(
        `Estimate gas failed, error message:${error.message}, error:${error.stack}`,
      );
      throw error;
    }
    try {
      const tx = await this.contractWithSigner.fill(
        fillData.v3RelayData,
        fillData.acrossDestinationFillerData,
        {
          gasLimit: Math.floor(Number(gasEstimate) * Number(1.3)),
        },
      );

      // Wait for the transaction to be mined
      this.logger.log(
        `Contract function called successfully, hash:${tx.hash},`,
      );
      return tx.hash;
    } catch (error) {
      this.logger.error(
        `Contract function called faild, error message:${error.message}, error:${error.stack}`,
      );
      return '';
    }
  }

  /**
   * @dev Convert Open event to Fill data
   * @param order  The Open event
   * @returns  The Fill data
   */
  private OpenToFillData(order: Open): {
    v3RelayData: V3RelayData;
    acrossDestinationFillerData: AcrossDestinationFillerData;
  } {
    return {
      v3RelayData: {
        depositor: order.resolvedOrder.user,
        recipient: '',
        exclusiveRelayer: this.filler.address,
        inputToken: order.resolvedOrder.maxSpent[0].token,
        outputToken: order.resolvedOrder.minReceived[0].token,
        inputAmount: order.resolvedOrder.maxSpent[0].amount,
        outputAmount: '0',
        originChainId: order.resolvedOrder.originChainId,
        depositId: 0,
        fillDeadline: order.resolvedOrder.fillDeadline,
        exclusivityDeadline: 0,
        message: '',
      } as V3RelayData,
      acrossDestinationFillerData: {
        repaymentChainId:
          order.resolvedOrder.fillInstructions[0].destinationChainId,
      } as AcrossDestinationFillerData,
    };
  }

  /**
   * @dev Fetch the Open logs from the contract
   * @returns  The logs from the contract
   * */
  private async fetchOpenLogs() {
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
        topics: [OpenEventHash],
      };

      const batchLogs = await this.provider.getLogs(filter);
      logs = logs.concat(batchLogs);
    }
    this.startBlockNumber = latestBlockNumber + 1;
    return logs;
  }

  /**
   * @dev Parse the logs to Open event
   * @param logs  The logs from the contract
   * @returns  The Open event
   * */
  private formatOpenEvent(logs: ethers.Log[]): Open[] {
    return logs.map((log) => {
      const parsedLog = ethers.AbiCoder.defaultAbiCoder().decode(
        [
          'bytes32',
          'tuple(address,uint256,uint32,uint32,bytes32,tuple(string,uint256,bytes32,uint256)[][],tuple(string,uint256,bytes32,uint256)[][],tuple(uint256,string,string)[])',
        ],
        log.data,
      );
      return {
        orderId: parsedLog[0],
        resolvedOrder: {
          user: parsedLog[1],
          originChainId: parsedLog[2],
          openDeadline: parsedLog[3],
          fillDeadline: parsedLog[4],
          orderId: parsedLog[5],
          maxSpent: parsedLog[6].map((output) => ({
            token: output[0],
            amount: output[1],
            recipient: output[2],
            chainId: output[3],
          })),
          minReceived: parsedLog[7].map((output) => ({
            token: output[0],
            amount: output[1],
            recipient: output[2],
            chainId: output[3],
          })),
          fillInstructions: parsedLog[8].map((fillInstruction) => ({
            destinationChainId: fillInstruction[0],
            destinationSettler: fillInstruction[1],
            originData: fillInstruction[2],
          })),
        },
      };
    });
  }
}
