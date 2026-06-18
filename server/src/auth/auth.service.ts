import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, contrasena } = loginDto;

    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        solicitudAgente: usuario.solicitudAgente,
        estadoSolicitud: usuario.estadoSolicitud,
      },
    };
  }
}
