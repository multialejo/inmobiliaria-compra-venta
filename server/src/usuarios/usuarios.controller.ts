import { Controller, Get, Patch, Param, Body, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsuariosService } from './usuarios.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolUsuario } from './entities/usuario.entity';

@Controller('usuarios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles('administrador')
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get('solicitudes-agente')
  @Roles('administrador')
  findSolicitudesAgente() {
    return this.usuariosService.findSolicitudesAgente();
  }

  @Patch('solicitar-agente')
  @Roles('cliente')
  solicitarAgente(
    @CurrentUser() user: { id: string },
    @Body() dto: { experienciaAgente?: string; licenciaAgente?: string; motivoAgente?: string }
  ) {
    return this.usuariosService.solicitarAgente(user.id, dto);
  }

  @Patch(':id/rol')
  @Roles('administrador')
  updateRol(
    @Param('id') id: string,
    @Body('rol') rol: RolUsuario,
  ) {
    return this.usuariosService.updateRol(id, rol);
  }

  @Patch(':id')
  @Roles('administrador')
  update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ) {
    return this.usuariosService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
