import { WatchEvent } from 'src/type';

export interface ClientInterface {
  chainId: number;
  startBlockNumber: number;
  confirmBlocs: number;

  /**
   * @dev Watch the Open event from the contract
   * @returns  The Open event
   * */
  watch(): Promise<WatchEvent[]>;

  /**
   * @dev Fill the Open event to the destination chain
   * @param orders  The Open event
   * */
  fill(orders: WatchEvent[]);

  /**
   * @dev Fill the Open event to the destination chain
   * @param order  The Open event
   * @returns  The transaction hash
   * */
  fillSingle(order: WatchEvent): Promise<string>;
}
