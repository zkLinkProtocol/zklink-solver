import { Injectable } from '@nestjs/common';
import { ClientService } from './chainClient/client.service';

@Injectable()
export class RelayerService {
  constructor(private clientService: ClientService) {}

  async bootstrap() {
    // start watching events
    this.whatchEvents();
  }

  async whatchEvents() {
    const stop = false;
    while (!stop) {
      // watch logs for new events from the support origin chain
      const clients = this.clientService.getClients();

      await Promise.all(
        clients.map(async ([, client]) => {
          const events = await client.watch();

          // and relay them to the destination chain
          this.relayEvents(events);
        }),
      );
    }
  }

  async relayEvents(events: any[]) {
    // relay events to the destination chain
    const destinationChainId = 2;
    const destinationClient =
      await this.clientService.getClient(destinationChainId);
    destinationClient.relay(events);
  }

  async waitFor(seconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
  }
}
