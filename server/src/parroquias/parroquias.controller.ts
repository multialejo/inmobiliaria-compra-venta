import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParroquiasService } from './parroquias.service';

@Controller('parroquias')
export class ParroquiasController {
  constructor(private readonly parroquiasService: ParroquiasService) {}

  @Get()
  findAll() {
    return this.parroquiasService.findAll();
  }

  @Get('canton/:cantonId')
  findByCanton(@Param('cantonId') cantonId: string) {
    return this.parroquiasService.findByCanton(+cantonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parroquiasService.findOne(+id);
  }
}
