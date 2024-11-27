import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientService } from './chainClient/client.service';
import { WatchEvent } from './type';
import { stringify, parse } from 'bigint-json';
import * as fs from 'fs';
import * as path from 'path';

const incompleteOrdersFile = '../data/incompletedOrders.json';

@Injectable()
export class RelayerService implements OnModuleInit {
  private orders: WatchEvent[] = [];
  private completedOrders: WatchEvent[] = [];

  constructor(private clientService: ClientService) {
    // Register handlers for process termination or errors
    this.setupProcessHandlers();
  }

  async onModuleInit() {
    // Load any incomplete orders from file when the service starts
    const incompleteOrders = await this.loadIncompleteOrders();
    if (incompleteOrders) {
      console.log(`Resuming ${incompleteOrders.length} incomplete orders`);
      await this.fillOrders(incompleteOrders);
    }
    await this.whatchEvents();
  }

  async whatchEvents() {
    // watch logs for new events from the support origin chain
    const clients = this.clientService.getClients();

    while (true) {
      console.log('Watching events start');
      await Promise.all(
        clients.map(async (client) => {
          const orders: WatchEvent[] = await client.watch();
          console.log(
            `Watching events end for chain ${client.chainId} from block ${client.startBlockNumber}, orders: ${orders.length}`,
          );
          if (orders.length === 0) {
            return;
          }
          await this.fillOrders(orders);
        }),
      );
      // wait for 3s
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  async fillOrders(orders: WatchEvent[]) {
    // and relay them to the destination chain
    this.orders = orders;
    this.completedOrders = [];
    for (const order of orders) {
      const destinationClient = this.clientService.getClient(
        order.destinationChainId,
      );
      if (!destinationClient) {
        console.error(
          `Invalid destination chain id ${order.destinationChainId}`,
        );
        continue;
      }
      try {
        const txhash = await destinationClient.fillSingle(order);
        this.completedOrders.push(order);
        // Wait for the transaction to be mined
        console.log(
          `Contract function called successfully, hash:${txhash}, order:${stringify(order)}`,
        );
      } catch (error) {
        this.completedOrders.push(order);
        console.error(
          `Failed to relay order ${stringify(order)} to chain ${order.destinationChainId}`,
          error,
        );
      }
    }
  }

  // Load incomplete orders from a file when the service starts
  private async loadIncompleteOrders() {
    const incompleteOrdersFilePath = path.resolve(
      __dirname,
      incompleteOrdersFile,
    );
    if (fs.existsSync(incompleteOrdersFilePath)) {
      try {
        const fileContent = fs.readFileSync(incompleteOrdersFilePath, 'utf-8');
        const incompleteOrders: WatchEvent[] = parse(fileContent);
        console.log(
          `Loaded ${incompleteOrders.length} incomplete orders from file`,
        );

        fs.writeFileSync(incompleteOrdersFilePath, ''); // Clear the file
        // Resume processing these incomplete orders if needed
        return incompleteOrders;
      } catch (error) {
        console.error('Failed to load incomplete orders:', error);
      }
    }
  }

  // If the process is interrupted manually or abnormally, the unfinished orders will be recorded in a file and will be continued at the next startup.
  // Exception handler that saves incompleted orders to a file
  async saveIncompleteOrders() {
    // Save the incompleted orders to a file
    console.log('Saving incompleted orders to file');
    const incompleteOrdersFilePath = path.resolve(
      __dirname,
      incompleteOrdersFile,
    );
    try {
      // Save the orders that are not yet completed (still in `this.orders`)
      const incompletedOrders = this.orders.filter(
        (order) => !this.completedOrders.includes(order),
      );
      if (incompletedOrders.length === 0) {
        console.log('No incompleted orders to save');
        return;
      }
      // Serialize to JSON
      fs.writeFileSync(
        incompleteOrdersFilePath,
        stringify(incompletedOrders, null, 2),
      );
      console.log('Incompleted orders saved successfully');
    } catch (error) {
      console.error('Error while saving incompleted orders:', error);
    }
  }

  private setupProcessHandlers() {
    // Handle manual termination (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('SIGINT received. Cleaning up...');
      await this.saveIncompleteOrders();
      process.exit(0); // Exit gracefully
    });

    // Handle termination signal
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Cleaning up...');
      await this.saveIncompleteOrders();
      process.exit(0); // Exit gracefully
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (err) => {
      console.error('Uncaught Exception:', err);
      await this.saveIncompleteOrders();
      process.exit(1); // Exit with failure
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      await this.saveIncompleteOrders();
      process.exit(1); // Exit with failure
    });
  }

  async onApplicationShutdown(signal?: string) {
    if (signal) {
      console.log(`Application received shutdown signal: ${signal}`);
    }
    await this.saveIncompleteOrders();
  }
}
