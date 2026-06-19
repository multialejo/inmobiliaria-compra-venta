import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';

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
        cedula: true,
        direccion: true,
        rol: true,
        solicitudAgente: true,
        estadoSolicitud: true,
        experienciaAgente: true,
        licenciaAgente: true,
        motivoAgente: true,
        motivoRechazo: true,
        fecha_registro: true,
      },
    });
  }

  findById(id: string) {
    return this.usuarioRepository.findOne({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        solicitudAgente: true,
        estadoSolicitud: true,
        fecha_registro: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.usuarioRepository.findOne({ where: { email } });
  }

  async solicitarAgente(id: string, dto: { experienciaAgente?: string; licenciaAgente?: string; motivoAgente?: string }) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    usuario.solicitudAgente = true;
    usuario.estadoSolicitud = 'pendiente';
    usuario.motivoRechazo = null; // Clear rejection reason when requesting again
    if (dto.experienciaAgente !== undefined) usuario.experienciaAgente = dto.experienciaAgente;
    if (dto.licenciaAgente !== undefined) usuario.licenciaAgente = dto.licenciaAgente;
    if (dto.motivoAgente !== undefined) usuario.motivoAgente = dto.motivoAgente;
    return this.usuarioRepository.save(usuario);
  }

  async updateRol(id: string, rol: RolUsuario, motivoRechazo?: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    usuario.rol = rol;
    usuario.solicitudAgente = false; // Reset the request status
    if (rol === RolUsuario.AGENTE) {
      usuario.estadoSolicitud = 'aprobada';
      usuario.motivoRechazo = null;
    } else if (rol === RolUsuario.CLIENTE) {
      usuario.estadoSolicitud = 'rechazada';
      usuario.motivoRechazo = motivoRechazo || null;
    } else {
      usuario.estadoSolicitud = 'ninguna';
      usuario.motivoRechazo = null;
    }
    return this.usuarioRepository.save(usuario);
  }

  async findSolicitudesAgente() {
    return this.usuarioRepository.find({
      where: { solicitudAgente: true },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        solicitudAgente: true,
        estadoSolicitud: true,
        fecha_registro: true,
      },
    });
  }

  async update(id: string, updateDto: any) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (updateDto.contrasena && !updateDto.contrasena.startsWith('$2')) {
      updateDto.contrasena = await bcrypt.hash(updateDto.contrasena, 10);
    }
    Object.assign(usuario, updateDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.usuarioRepository.manager.delete('intereses', { cliente_id: id });
    await this.usuarioRepository.manager.delete('compras', { cliente_id: id });
    await this.usuarioRepository.remove(usuario);
    return { message: 'Usuario de baja exitosa' };
  }
}
