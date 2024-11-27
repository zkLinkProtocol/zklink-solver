import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RelayerService } from './relayer.service';
import { ClientService } from './chainClient/client.service';
import { ConfigModule } from '@nestjs/config';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [config],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, RelayerService, ClientService],
})
export class AppModule {}
