import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientesService } from './clientes.service';
import { RegisterClienteDto } from './dto/register-cliente.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post('register')
  register(@Body() registerClienteDto: RegisterClienteDto) {
    return this.clientesService.register(registerClienteDto);
  }

  @Get('perfil')
  @UseGuards(AuthGuard('jwt'))
  getPerfil(@CurrentUser() user: { id: string }) {
    return this.clientesService.getPerfil(user.id);
  }

  @Patch('perfil')
  @UseGuards(AuthGuard('jwt'))
  updatePerfil(
    @CurrentUser() user: { id: string },
    @Body() updatePerfilDto: UpdatePerfilDto,
  ) {
    return this.clientesService.updatePerfil(user.id, updatePerfilDto);
  }
}
