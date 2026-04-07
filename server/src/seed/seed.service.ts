import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Canton } from '../cantones/entities/canton.entity';
import { Parroquia } from '../parroquias/entities/parroquia.entity';
import bolivarData from './data/bolivar.json';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Canton)
    private cantonRepository: Repository<Canton>,
    @InjectRepository(Parroquia)
    private parroquiaRepository: Repository<Parroquia>,
  ) { }

  async onModuleInit() {
    const count = await this.cantonRepository.count();
    if (count > 0) {
      console.log('Los datos de Bolívar ya están seedeados');
      return;
    }
    await this.seedBolivar();
  }

  async seedBolivar() {
    // console.log('Iniciando seed de cantones y parroquias de Bolívar...');

    for (const [cantonKey, cantonData] of Object.entries(bolivarData)) {
      const canton = this.cantonRepository.create({
        id: parseInt(cantonKey),
        nombre: cantonData.canton,
      });
      await this.cantonRepository.save(canton);

      const parroquias = Object.entries(cantonData.parroquias).map(
        ([key, value]) => ({
          id: parseInt(key),
          nombre: value,
          canton_id: parseInt(cantonKey),
        }),
      );

      for (const parroquia of parroquias) {
        const newParroquia = this.parroquiaRepository.create(parroquia);
        await this.parroquiaRepository.save(newParroquia);
      }

      console.log(
        `Canton ${cantonData.canton} seedeado con ${parroquias.length} parroquias`,
      );
    }

    // console.log('Seed de Bolívar completado!');
  }

  async reset() {
    await this.parroquiaRepository.delete({});
    await this.cantonRepository.delete({});
    console.log('Datos de Bolívar eliminados');
    await this.seedBolivar();
  }
}
