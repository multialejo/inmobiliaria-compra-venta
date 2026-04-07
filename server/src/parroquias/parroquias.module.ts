import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParroquiasService } from './parroquias.service';
import { ParroquiasController } from './parroquias.controller';
import { Parroquia } from './entities/parroquia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parroquia])],
  controllers: [ParroquiasController],
  providers: [ParroquiasService],
  exports: [ParroquiasService],
})
export class ParroquiasModule {}
