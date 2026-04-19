import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PropiedadesService } from './propiedades.service';
import { CreatePropiedadDto } from './dto/create-propiedad.dto';
import { UpdatePropiedadDto } from './dto/update-propiedad.dto';

@Controller('propiedades')
export class PropiedadesController {
  constructor(private readonly propiedadesService: PropiedadesService) { }

  @Post()
  create(@Body() createPropiedadDto: CreatePropiedadDto) {
    return this.propiedadesService.create(createPropiedadDto);
  }

  @Get()
  findAll() {
    return this.propiedadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propiedadesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropiedadDto: UpdatePropiedadDto,
  ) {
    return this.propiedadesService.update(+id, updatePropiedadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propiedadesService.remove(+id);
  }

  @Get('canton/:cantonId')
  findByCanton(@Param('cantonId') cantonId: string) {
    return this.propiedadesService.findByCanton(+cantonId);
  }

  @Get('parroquia/:parroquiaId')
  findByParroquia(@Param('parroquiaId') parroquiaId: string) {
    return this.propiedadesService.findByParroquia(+parroquiaId);
  }

  @Get('agente/:agenteId')
  findByAgente(@Param('agenteId') agenteId: string) {
    return this.propiedadesService.findByAgente(agenteId);
  }
}
