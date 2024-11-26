import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientService } from './chainClient/client.service';
import { Open } from './type';

@Injectable()
export class RelayerService implements OnModuleInit {
  constructor(private clientService: ClientService) {}

  async onModuleInit() {
    this.bootstrap();
  }

  async bootstrap() {
    // start watching events
    this.whatchEvents();
  }

  async whatchEvents() {
    const stop = false;
    // watch logs for new events from the support origin chain
    const clients = this.clientService.getClients();
    while (!stop) {
      await Promise.all(
        clients.map(async (client) => {
          const orders: Open[] = await client.watch();

          // and relay them to the destination chain
          for (const order of orders) {
            const destinationClient = this.clientService.getClient(
              order.resolvedOrder.fillInstructions[0].destinationChainId,
            );
            await destinationClient.fillSingle(order);
          }
        }),
      );
    }
  }
}
