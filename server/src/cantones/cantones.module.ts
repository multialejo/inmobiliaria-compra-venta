import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CantonesService } from './cantones.service';
import { CantonesController } from './cantones.controller';
import { Canton } from './entities/canton.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Canton])],
  controllers: [CantonesController],
  providers: [CantonesService],
  exports: [CantonesService],
})
export class CantonesModule {}
