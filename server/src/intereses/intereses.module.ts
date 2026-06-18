import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteresesService } from './intereses.service';
import { InteresesController } from './intereses.controller';
import { Interes } from './entities/interes.entity';
import { Propiedad } from '../propiedades/entities/propiedad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interes, Propiedad])],
  controllers: [InteresesController],
  providers: [InteresesService],
})
export class InteresesModule {}
