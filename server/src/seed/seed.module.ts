import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Canton } from '../cantones/entities/canton.entity';
import { Parroquia } from '../parroquias/entities/parroquia.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Canton, Parroquia])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
