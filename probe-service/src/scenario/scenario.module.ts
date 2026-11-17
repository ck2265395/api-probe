import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioController } from './scenario.controller';
import { ScenarioModel } from './scenario.model';
import { ScenarioService } from './scenario.service';
import { ScenarioVersionModel } from './scenario-version.model';

@Module({
  imports: [TypeOrmModule.forFeature([ScenarioModel, ScenarioVersionModel])],
  controllers: [ScenarioController],
  providers: [ScenarioService],
  exports: [ScenarioService],
})
export class ScenarioModule {}
