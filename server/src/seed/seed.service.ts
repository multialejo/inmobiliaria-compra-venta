import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Canton } from '../cantones/entities/canton.entity';
import { Parroquia } from '../parroquias/entities/parroquia.entity';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import bolivarData from './data/bolivar.json';
import usuariosData from './data/usuarios.json';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Canton)
    private cantonRepository: Repository<Canton>,
    @InjectRepository(Parroquia)
    private parroquiaRepository: Repository<Parroquia>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    const count = await this.cantonRepository.count();
    if (count > 0) {
      console.log('Los datos de Bolívar ya están seedeados');
      return;
    }
    await this.seedBolivar();
    await this.seedUsuarios();
  }

  async seedBolivar() {
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
  }

  async seedUsuarios() {
    for (const usuario of usuariosData) {
      const newUsuario = this.usuarioRepository.create({
        ...usuario,
        rol:
          usuario.rol === 'administrador'
            ? RolUsuario.ADMINISTRADOR
            : RolUsuario.AGENTE,
      });
      await this.usuarioRepository.save(newUsuario);
    }

    console.log(`Seedeados ${usuariosData.length} usuarios`);
  }

  async reset() {
    await this.parroquiaRepository.delete({});
    await this.cantonRepository.delete({});
    console.log('Datos de Bolívar eliminados');
    await this.seedBolivar();
    await this.seedUsuarios();
  }
}
