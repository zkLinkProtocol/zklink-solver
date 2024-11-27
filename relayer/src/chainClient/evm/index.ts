import { Injectable, Logger } from '@nestjs/common';
import { ethers, AbiCoder } from 'ethers';
import { stringify } from 'bigint-json';
import * as fs from 'fs';
import * as path from 'path';
import { Open, V3FundsDeposited, V3RelayData, WatchEvent } from '../../type';
import { zklinkAcrossChainAbi } from './zklinkAcross.abi.json';
import { ClientInterface } from '../client.interface';
import { addressToBytes32, bytes32ToAddress } from './utils';

const OpenEventHash =
  '0xa576d0af275d0c6207ef43ceee8c498a5d7a26b8157a32d3fdf361e64371628c';
const v3FundsDepositedEventHash =
  '0x74ba8f97c2d5f1f9b1bff422e55e2b17ae3d0a4166444703f16dc8d0224266b9';
const BatchSize = 1024;
const startBlockNumberFilePrefix = './../../../data/startBlockNumber_';

@Injectable()
export class Evm implements ClientInterface {
  private readonly rpc: string = '';
  private readonly logger = new Logger('Evm');
  private readonly filler: ethers.Wallet;
  private readonly contractAddress: string;
  private readonly provider: ethers.JsonRpcProvider;
  private readonly iface: ethers.Interface = new ethers.Interface(
    zklinkAcrossChainAbi,
  );
  private contractWithSigner;

  public startBlockNumber: number;
  public readonly chainId: number;
  public readonly confirmBlocs: number = 12;

  constructor(
    chainId: number,
    rpcUrl: string,
    contractAddress: string,
    startBlockNumber: number,
    confirmBlocks: number,
  ) {
    this.rpc = rpcUrl;
    this.chainId = chainId;
    this.confirmBlocs = confirmBlocks;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = contractAddress;
    const privateKey = process.env.FILLER_PK;
    this.filler = new ethers.Wallet(privateKey, this.provider);
    const contract = new ethers.Contract(
      contractAddress,
      zklinkAcrossChainAbi,
      this.provider,
    );
    this.contractWithSigner = contract.connect(this.filler);
    const startBlockNumberFromFile = this.loadStartBlockNumber();
    if (startBlockNumberFromFile) {
      this.startBlockNumber = startBlockNumberFromFile;
    } else {
      this.startBlockNumber = startBlockNumber;
    }
  }

  /**
   * @dev Watch the Open event from the contract
   * @returns  The Open event
   * */
  async watch(): Promise<WatchEvent[]> {
    return await this.fetchLogs();
  }

  /**
   * @dev Fill the Open event to the destination chain
   * @param orders  The Open event
   * */
  async fill(orders: WatchEvent[]) {
    // Call contract function
    const txhashs = [];
    for (const order of orders) {
      try {
        txhashs.push(await this.fillSingle(order));
      } catch (error) {
        this.logger.error(
          `Fill order failed, error message:${error.message}, error:${error.stack}`,
        );
      }
    }
    return txhashs;
  }

  /**
   * @dev Fill the Open event to the destination chain
   * @param order  The Open event
   * @returns  The transaction hash
   * */
  async fillSingle(order: WatchEvent): Promise<string> {
    const fillData = this.watchEventToFillData(order);
    let gasEstimate = 0;
    try {
      gasEstimate = await this.contractWithSigner.fill.estimateGas(
        fillData.orderId,
        fillData.v3RelayData,
        fillData.acrossDestinationFillerData,
      );
    } catch (error) {
      this.logger.error(
        `Estimate gas failed, filler:${this.filler.address}, fillData:${stringify(fillData)}, error message:${error.message}, error:${error.stack}`,
      );
      throw error;
    }
    const gasLimit = Math.floor(Number(gasEstimate) * Number(1.3));
    const feedata = await this.provider.getFeeData();
    const gasPrice = feedata.gasPrice * 2n;
    try {
      const tx = await this.contractWithSigner.fill(
        fillData.orderId,
        fillData.v3RelayData,
        fillData.acrossDestinationFillerData,
        {
          gasLimit,
          gasPrice,
        },
      );
      return tx.hash;
    } catch (error) {
      this.logger.error(
        `Contract function called faild, filler:${this.filler.address}, fillData:${stringify(fillData)}, gasLimit:${gasLimit}, error message:${error.message}, error:${error.stack}`,
      );
      throw error;
    }
  }

  /**
   * @dev Fetch the logs from the contract
   * @returns  The logs from the contract
   * */
  private async fetchLogs(): Promise<WatchEvent[]> {
    const batchLogsMap: Map<string, WatchEvent> = new Map();
    let latestBlockNumber = await this.provider.getBlockNumber();

    // confirmBlocs blocks behind the latest block
    latestBlockNumber -= this.confirmBlocs;

    let fromBlock = this.startBlockNumber;
    while (true) {
      this.logger.log(
        `Fetching logs from block ${fromBlock} of chain ${this.chainId}, latest block number is ${latestBlockNumber}`,
      );
      const toBlock = Math.min(fromBlock + BatchSize - 1, latestBlockNumber);
      const filter = {
        fromBlock: fromBlock,
        toBlock,
        address: this.contractAddress,
        topics: [[OpenEventHash, v3FundsDepositedEventHash]],
      };

      try {
        const batchLogs = await this.provider.getLogs(filter);
        // migrate logs which are OpenEventHash's transaction hash === v3FundsDepositedEventHash's transaction hash
        for (const log of batchLogs) {
          const transactionHash = log.transactionHash;
          if (batchLogsMap.has(transactionHash)) {
            let tmpWhatchEvent = batchLogsMap.get(transactionHash);
            tmpWhatchEvent = this.formatEvent(log, tmpWhatchEvent);
            batchLogsMap.set(transactionHash, tmpWhatchEvent);
          } else {
            const tmpWhatchEvent = this.formatEvent(log);
            batchLogsMap.set(transactionHash, tmpWhatchEvent);
          }
        }
      } catch (error) {
        this.logger.error(
          `Fetch logs failed, chanId:${this.chainId}, rpc:${this.rpc}, error message:${error.message}, error:${error.stack}`,
        );
      }
      if (toBlock - fromBlock < BatchSize - 1) {
        break;
      }
      fromBlock += BatchSize;
    }
    this.startBlockNumber = latestBlockNumber + 1;
    await this.saveStartBlockNumber();
    return Array.from(batchLogsMap.values());
  }

  /**
   * @dev Format the log to WatchEvent
   * @param log The log from the contract
   * @param watchEvent The WatchEvent
   * @returns The WatchEvent
   */
  private formatEvent(
    log: ethers.Log,
    watchEvent: WatchEvent = null,
  ): WatchEvent {
    const tmpWhatchEvent: WatchEvent = watchEvent
      ? watchEvent
      : ({} as WatchEvent);
    if (log.topics[0] === OpenEventHash) {
      const openEventData = this.formatOpenEvent(log);
      tmpWhatchEvent.orderId = openEventData.orderId;
    } else if (log.topics[0] === v3FundsDepositedEventHash) {
      const v3FundsDepositedEventData = this.formatV3FundsDepositedEvent(log);
      const order = {
        depositId: v3FundsDepositedEventData.depositId,
        depositor: v3FundsDepositedEventData.depositor,
        exclusiveRelayer: v3FundsDepositedEventData.exclusiveRelayer,
        fillDeadline: v3FundsDepositedEventData.fillDeadline,
        inputAmount: v3FundsDepositedEventData.inputAmount,
        inputToken: v3FundsDepositedEventData.inputToken,
        message: v3FundsDepositedEventData.message,
        outputAmount: v3FundsDepositedEventData.outputAmount,
        outputToken: v3FundsDepositedEventData.outputToken,
        recipient: v3FundsDepositedEventData.recipient,
        exclusivityDeadline: v3FundsDepositedEventData.exclusivityDeadline,
        originChainId: this.chainId,
      };

      tmpWhatchEvent.destinationChainId =
        v3FundsDepositedEventData.destinationChainId;
      tmpWhatchEvent.order = order;
    }
    return tmpWhatchEvent;
  }

  /**
   * @dev Parse the log to Open event
   * @param log  The log from the contract
   * @returns  The Open event
   * */
  private formatOpenEvent(log: ethers.Log): Open {
    const parsedLog = this.iface.decodeEventLog('Open', log.data, log.topics);
    return {
      orderId: parsedLog[0],
      resolvedOrder: {
        user: parsedLog[1][0],
        originChainId: Number(BigInt(parsedLog[1][1])),
        openDeadline: Number(BigInt(parsedLog[1][2])),
        fillDeadline: Number(BigInt(parsedLog[1][3])),
        orderId: parsedLog[1][4],
        maxSpent: parsedLog[1][5].map((output) => ({
          token: bytes32ToAddress(output[0]),
          amount: output[1],
          recipient: bytes32ToAddress(output[2]),
          chainId: Number(BigInt(output[3])),
        })),
        minReceived: parsedLog[1][6].map((output) => ({
          token: bytes32ToAddress(output[0]),
          amount: output[1],
          recipient: bytes32ToAddress(output[2]),
          chainId: Number(BigInt(output[3])),
        })),
        fillInstructions: parsedLog[1][7].map((fillInstruction) => ({
          destinationChainId: Number(BigInt(fillInstruction[0])),
          destinationSettler: bytes32ToAddress(fillInstruction[1]),
          originData: fillInstruction[2],
        })),
      },
    };
  }

  /**
   * @dev Parse the log to V3FundsDeposited event
   * @param log  The log from the contract
   * @returns The V3FundsDeposited event
   */
  private formatV3FundsDepositedEvent(log: ethers.Log): V3FundsDeposited {
    const parsedLog = this.iface.decodeEventLog(
      'V3FundsDeposited',
      log.data,
      log.topics,
    );
    return {
      inputToken: parsedLog[0],
      outputToken: bytes32ToAddress(parsedLog[1]),
      inputAmount: parsedLog[2],
      outputAmount: parsedLog[3],
      destinationChainId: Number(BigInt(parsedLog[4])),
      depositId: Number(BigInt(parsedLog[5])),
      quoteTimestamp: parsedLog[6],
      fillDeadline: Number(BigInt(parsedLog[7])),
      exclusivityDeadline: Number(BigInt(parsedLog[8])),
      depositor: parsedLog[9],
      recipient: bytes32ToAddress(parsedLog[10]),
      exclusiveRelayer: bytes32ToAddress(parsedLog[11]),
      message: parsedLog[12],
    };
  }

  /**
   * @dev Convert WatchEvent to Fill data
   * @param watchEvent  The WatchEvent
   * @returns  The Fill data
   */
  private watchEventToFillData(watchEvent: WatchEvent): {
    orderId: string;
    v3RelayData: string;
    acrossDestinationFillerData: string;
  } {
    const abiCoder = AbiCoder.defaultAbiCoder();
    const v3RelayData = {
      depositor: addressToBytes32(watchEvent.order.depositor),
      recipient: addressToBytes32(watchEvent.order.recipient),
      exclusiveRelayer: addressToBytes32(watchEvent.order.exclusiveRelayer),
      inputToken: addressToBytes32(watchEvent.order.inputToken),
      outputToken: addressToBytes32(watchEvent.order.outputToken),
      inputAmount: watchEvent.order.inputAmount,
      outputAmount: watchEvent.order.outputAmount,
      originChainId: watchEvent.order.originChainId,
      depositId: watchEvent.order.depositId,
      fillDeadline: watchEvent.order.fillDeadline,
      exclusivityDeadline: watchEvent.order.exclusivityDeadline,
      message: watchEvent.order.message,
    } as V3RelayData;

    return {
      orderId: watchEvent.orderId,
      v3RelayData: abiCoder.encode(
        [
          'tuple(bytes32,bytes32,bytes32,bytes32,bytes32,uint256,uint256,uint256,uint32,uint32,uint32,bytes)',
        ],
        [
          [
            v3RelayData.depositor,
            v3RelayData.recipient,
            v3RelayData.exclusiveRelayer,
            v3RelayData.inputToken,
            v3RelayData.outputToken,
            v3RelayData.inputAmount,
            v3RelayData.outputAmount,
            v3RelayData.originChainId,
            v3RelayData.depositId,
            v3RelayData.fillDeadline,
            v3RelayData.exclusivityDeadline,
            v3RelayData.message,
          ],
        ],
      ),
      acrossDestinationFillerData: abiCoder.encode(
        ['tuple(uint256)'],
        [[watchEvent.destinationChainId]],
      ),
    };
  }

  /**
   * @dev Save the start block number to file
   */
  private saveStartBlockNumber() {
    // save start block number to file
    const fpath = path.resolve(
      __dirname,
      `${startBlockNumberFilePrefix}${this.chainId}.txt`,
    );
    fs.writeFileSync(fpath, this.startBlockNumber.toString());
    this.logger.log(`Save start block number ${this.startBlockNumber} to file`);
  }

  /**
   * @dev Load the start block number from file
   * @returns The start block number
   */
  private loadStartBlockNumber() {
    // load start block number from file
    const fpath = path.resolve(
      __dirname,
      `${startBlockNumberFilePrefix}${this.chainId}.txt`,
    );
    if (fs.existsSync(fpath)) {
      return parseInt(fs.readFileSync(fpath).toString());
    } else {
      return 0;
    }
  }
}
