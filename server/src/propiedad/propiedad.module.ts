// src/propiedad/propiedad.module.ts
import { Module } from '@nestjs/common';
import { PropiedadService } from './propiedad.service';
import { PropiedadController } from './propiedad.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PropiedadController],
  providers: [PropiedadService, PrismaService],
  exports: [PropiedadService],
})
export class PropiedadModule {}
