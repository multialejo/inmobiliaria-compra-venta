import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('compras')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @Roles('cliente', 'agente', 'administrador')
  create(
    @Body() createCompraDto: CreateCompraDto,
    @CurrentUser() user: { id: string; rol: string },
  ) {
    return this.comprasService.create(createCompraDto, user.id);
  }

  @Get('mis-compras')
  @Roles('cliente')
  findMine(@CurrentUser() user: { id: string; rol: string }) {
    return this.comprasService.findMine(user.id);
  }

  @Get()
  @Roles('administrador', 'agente')
  findAll(@CurrentUser() user: { id: string; rol: string }) {
    return this.comprasService.findAll(user);
  }

  @Patch(':id')
  @Roles('administrador', 'agente')
  update(
    @Param('id') id: string,
    @Body() updateCompraDto: UpdateCompraDto,
    @CurrentUser() user: { id: string; rol: string },
  ) {
    return this.comprasService.update(id, updateCompraDto, user);
  }
}
