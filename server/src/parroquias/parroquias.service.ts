import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parroquia } from './entities/parroquia.entity';

@Injectable()
export class ParroquiasService {
  constructor(
    @InjectRepository(Parroquia)
    private parroquiasRepository: Repository<Parroquia>,
  ) {}

  findAll() {
    return this.parroquiasRepository.find();
  }

  findOne(id: number) {
    return this.parroquiasRepository.findOne({ where: { id } });
  }

  findByCanton(cantonId: number) {
    return this.parroquiasRepository.find({
      where: { canton_id: cantonId },
    });
  }
}
