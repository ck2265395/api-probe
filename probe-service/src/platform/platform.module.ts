import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoService } from '../common/crypto.service';
import { EnvironmentModel } from './environment.model';
import { PlatformController } from './platform.controller';
import { PlatformModel } from './platform.model';
import { PlatformService } from './platform.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformModel, EnvironmentModel])],
  controllers: [PlatformController],
  providers: [PlatformService, CryptoService],
  exports: [PlatformService],
})
export class PlatformModule {}

