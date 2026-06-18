import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { RegisterClienteDto } from './dto/register-cliente.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async register(registerClienteDto: RegisterClienteDto) {
    const existe = await this.usuarioRepository.findOne({
      where: { email: registerClienteDto.email },
    });
    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const usuario = this.usuarioRepository.create({
      ...registerClienteDto,
      rol: RolUsuario.CLIENTE,
    });
    return this.usuarioRepository.save(usuario);
  }

  async findAll(user: { id: string; rol: string }) {
    if (user.rol === RolUsuario.ADMINISTRADOR) {
      return this.usuarioRepository.find({
        where: { rol: RolUsuario.CLIENTE },
        relations: ['intereses', 'intereses.propiedad', 'intereses.propiedad.agente'],
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
          cedula: true,
          direccion: true,
          rol: true,
          fecha_registro: true,
        },
        order: { fecha_registro: 'DESC' },
      });
    }

    if (user.rol === RolUsuario.AGENTE) {
      return this.usuarioRepository.createQueryBuilder('usuario')
        .innerJoinAndSelect('usuario.intereses', 'interes')
        .innerJoinAndSelect('interes.propiedad', 'propiedad')
        .leftJoinAndSelect('propiedad.agente', 'agente')
        .leftJoinAndSelect('propiedad.canton', 'canton')
        .leftJoinAndSelect('propiedad.parroquia', 'parroquia')
        .where('usuario.rol = :rol', { rol: RolUsuario.CLIENTE })
        .andWhere('propiedad.agente_id = :agenteId', { agenteId: user.id })
        .orderBy('usuario.fecha_registro', 'DESC')
        .getMany();
    }

    return [];
  }

  async getPerfil(id: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        cedula: true,
        direccion: true,
        rol: true,
        solicitudAgente: true,
        estadoSolicitud: true,
        fecha_registro: true,
      },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async updatePerfil(id: string, updatePerfilDto: UpdatePerfilDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    Object.assign(usuario, updatePerfilDto);
    return this.usuarioRepository.save(usuario);
  }
}
