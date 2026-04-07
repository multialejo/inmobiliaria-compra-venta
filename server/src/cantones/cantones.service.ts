import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Canton } from './entities/canton.entity';

@Injectable()
export class CantonesService {
  constructor(
    @InjectRepository(Canton)
    private cantonRepository: Repository<Canton>,
  ) {}

  findAll() {
    return this.cantonRepository.find();
  }

  findOne(id: number) {
    return this.cantonRepository.findOne({ where: { id } });
  }
}
