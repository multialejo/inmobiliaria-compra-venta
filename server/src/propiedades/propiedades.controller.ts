/**
 * @file propiedades.controller.ts
 * @brief Controlador REST para la administración de propiedades e inmuebles.
 * 
 * @section estructura Estructura del Controlador
 * Expone los endpoints de la API bajo el prefijo `/api/propiedades`. Se encarga de recibir,
 * validar y mapear los DTOs de entrada, delegando la lógica de negocio en `PropiedadesService`.
 * 
 * @section seguridad Guardias y Roles
 * - Toda la clase está protegida con `AuthGuard('jwt')` (requiere un token JWT válido) y `RolesGuard`.
 * - **Creación (POST)** y **Edición (PATCH)**: Restringido a usuarios con rol `administrador` o `agente` (`@Roles('administrador', 'agente')`).
 * - **Eliminación (DELETE)**: Restringido a usuarios con rol `administrador` o `agente` (`@Roles('administrador', 'agente')`).
 * - **Búsquedas públicas**: Las búsquedas por Cantón e ID permiten acceso a clientes.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PropiedadesService } from './propiedades.service';
import { CreatePropiedadDto } from './dto/create-propiedad.dto';
import { UpdatePropiedadDto } from './dto/update-propiedad.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('propiedades')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PropiedadesController {
  constructor(private readonly propiedadesService: PropiedadesService) {}

  @Post()
  @Roles('administrador', 'agente')
  create(
    @Body() createPropiedadDto: CreatePropiedadDto,
    @CurrentUser() user: { id: string; rol: string },
  ) {
    if (user.rol === 'agente') {
      createPropiedadDto.agente_id = user.id;
    }
    return this.propiedadesService.create(createPropiedadDto);
  }

  @Get()
  @Roles('administrador', 'agente', 'cliente')
  findAll(@CurrentUser() user: { id: string; rol: string }) {
    if (user.rol === 'agente') {
      return this.propiedadesService.findByAgente(user.id);
    }
    return this.propiedadesService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'agente', 'cliente')
  findOne(@Param('id') id: string) {
    return this.propiedadesService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'agente')
  update(
    @Param('id') id: string,
    @Body() updatePropiedadDto: UpdatePropiedadDto,
    @CurrentUser() user: { id: string; rol: string },
  ) {
    return this.propiedadesService.update(id, updatePropiedadDto, user);
  }

  @Delete(':id')
  @Roles('administrador', 'agente')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; rol: string },
  ) {
    return this.propiedadesService.remove(id, user);
  }

  @Get('canton/:cantonId')
  @Roles('administrador', 'agente', 'cliente')
  findByCanton(@Param('cantonId') cantonId: string) {
    return this.propiedadesService.findByCanton(+cantonId);
  }

  @Get('parroquia/:parroquiaId')
  @Roles('administrador', 'agente', 'cliente')
  findByParroquia(@Param('parroquiaId') parroquiaId: string) {
    return this.propiedadesService.findByParroquia(+parroquiaId);
  }
}
