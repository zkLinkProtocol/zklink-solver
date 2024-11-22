import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RelayerService } from './relayer.service';
import { ClientService } from './chainClient/client.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RelayerService, ClientService],
})
export class AppModule {}
