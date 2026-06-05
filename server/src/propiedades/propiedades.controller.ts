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
  @Roles('administrador', 'agente')
  findAll(@CurrentUser() user: { id: string; rol: string }) {
    if (user.rol === 'agente') {
      return this.propiedadesService.findByAgente(user.id);
    }
    return this.propiedadesService.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'agente')
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
  @Roles('administrador')
  remove(@Param('id') id: string) {
    return this.propiedadesService.remove(id);
  }

  @Get('canton/:cantonId')
  @Roles('administrador', 'agente')
  findByCanton(@Param('cantonId') cantonId: string) {
    return this.propiedadesService.findByCanton(+cantonId);
  }

  @Get('parroquia/:parroquiaId')
  @Roles('administrador', 'agente')
  findByParroquia(@Param('parroquiaId') parroquiaId: string) {
    return this.propiedadesService.findByParroquia(+parroquiaId);
  }
}
