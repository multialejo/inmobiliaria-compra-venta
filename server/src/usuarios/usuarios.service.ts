import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  findAll() {
    return this.usuarioRepository.find({
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        fecha_registro: true,
      },
    });
  }
}