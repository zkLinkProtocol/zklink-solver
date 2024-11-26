import { Open } from 'src/type';

export interface ClientInterface {
  /**
   * @dev Watch the Open event from the contract
   * @returns  The Open event
   * */
  watch(): Promise<Open[]>;

  /**
   * @dev Fill the Open event to the destination chain
   * @param orders  The Open event
   * */
  fill(orders: Open[]);

  /**
   * @dev Fill the Open event to the destination chain
   * @param order  The Open event
   * @returns  The transaction hash
   * */
  fillSingle(order: Open): Promise<string>;
}
