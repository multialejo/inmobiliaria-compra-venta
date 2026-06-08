import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteresesService } from './intereses.service';
import { InteresesController } from './intereses.controller';
import { Interes } from './entities/interes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interes])],
  controllers: [InteresesController],
  providers: [InteresesService],
})
export class InteresesModule {}
