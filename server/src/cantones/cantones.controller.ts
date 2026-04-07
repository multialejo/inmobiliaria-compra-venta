import { Controller, Get, Param } from '@nestjs/common';
import { CantonesService } from './cantones.service';

@Controller('cantones')
export class CantonesController {
  constructor(private readonly cantonesService: CantonesService) {}

  @Get()
  findAll() {
    return this.cantonesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cantonesService.findOne(+id);
  }
}
