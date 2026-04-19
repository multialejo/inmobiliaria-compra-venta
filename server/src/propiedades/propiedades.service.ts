import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Propiedad } from './entities/propiedad.entity';
import { CreatePropiedadDto } from './dto/create-propiedad.dto';
import { UpdatePropiedadDto } from './dto/update-propiedad.dto';

@Injectable()
export class PropiedadesService {
  constructor(
    @InjectRepository(Propiedad)
    private propiedadRepository: Repository<Propiedad>,
  ) { }

  create(createPropiedadDto: CreatePropiedadDto) {
    const propiedad = this.propiedadRepository.create(createPropiedadDto);
    return this.propiedadRepository.save(propiedad);
  }

  findAll() {
    return this.propiedadRepository.find({
      relations: ['canton', 'parroquia', 'agente'],
    });
  }

  async findOne(id: string): Promise<Propiedad> {
    // const propiedad = await this.propiedadRepository.findOneBy({id});
    const propiedad = await this.propiedadRepository.findOne({
      where: { id },
      relations: ['canton', 'parroquia', 'agente'],
    });
    if (!propiedad) {
      throw new NotFoundException(`Propiedad con ID ${id} no encontrada`);
    }
    return propiedad;
  }

  async update(id: string, updatePropiedadDto: UpdatePropiedadDto) {
    const propiedad = await this.findOne(id);
    Object.assign(propiedad, updatePropiedadDto);
    return this.propiedadRepository.save(propiedad);
  }

  async remove(id: string) {
    const propiedad = await this.findOne(id);
    await this.propiedadRepository.remove(propiedad);
    return { message: `Propiedad con ID ${id} eliminada` };
  }

  findByCanton(cantonId: number) {
    return this.propiedadRepository.find({
      where: { canton_id: cantonId },
      relations: ['canton', 'parroquia', 'agente'],
    });
  }

  findByParroquia(parroquiaId: number) {
    return this.propiedadRepository
      .createQueryBuilder('propiedad')
      .leftJoinAndSelect('propiedad.canton', 'canton')
      .leftJoinAndSelect('propiedad.parroquia', 'parroquia')
      .leftJoinAndSelect('propiedad.agente', 'agente')
      .where('propiedad.parroquia_id = :id', { id: parroquiaId })
      .getMany();
  }

  findByAgente(agenteId: string) {
    return this.propiedadRepository.find({
      where: { agente_id: agenteId },
      relations: ['canton', 'parroquia', 'agente'],
    });
  }
}
