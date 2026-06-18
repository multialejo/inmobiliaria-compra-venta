import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interes } from './entities/interes.entity';
import { CreateInteresDto } from './dto/create-interes.dto';
import { UpdateInteresDto } from './dto/update-interes.dto';
import { Propiedad, EstadoPropiedad } from '../propiedades/entities/propiedad.entity';

@Injectable()
export class InteresesService {
  constructor(
    @InjectRepository(Interes)
    private interesRepository: Repository<Interes>,
    @InjectRepository(Propiedad)
    private propiedadRepository: Repository<Propiedad>,
  ) {}

  async create(createInteresDto: CreateInteresDto, clienteId: string) {
    const interes = this.interesRepository.create({
      ...createInteresDto,
      cliente_id: clienteId,
    });
    const savedInteres = await this.interesRepository.save(interes);

    // Update property status to 'vendida'
    const propiedad = await this.propiedadRepository.findOne({
      where: { id: createInteresDto.propiedad_id }
    });
    if (propiedad) {
      propiedad.estado = EstadoPropiedad.VENDIDA;
      await this.propiedadRepository.save(propiedad);
    }

    return savedInteres;
  }

  findAll() {
    return this.interesRepository.find({
      relations: ['cliente', 'propiedad'],
    });
  }

  findMine(clienteId: string) {
    return this.interesRepository.find({
      where: { cliente_id: clienteId },
      relations: ['propiedad', 'propiedad.canton', 'propiedad.parroquia'],
    });
  }

  async update(id: string, updateInteresDto: UpdateInteresDto) {
    const interes = await this.interesRepository.findOne({
      where: { id },
    });
    if (!interes) {
      throw new NotFoundException(`Interes con ID ${id} no encontrado`);
    }
    Object.assign(interes, updateInteresDto);
    return this.interesRepository.save(interes);
  }
}
