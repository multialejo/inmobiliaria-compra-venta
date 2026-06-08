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
import { InteresesService } from './intereses.service';
import { CreateInteresDto } from './dto/create-interes.dto';
import { UpdateInteresDto } from './dto/update-interes.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('intereses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InteresesController {
  constructor(private readonly interesesService: InteresesService) {}

  @Post()
  @Roles('cliente')
  create(
    @Body() createInteresDto: CreateInteresDto,
    @CurrentUser() user: { id: string; rol: string },
  ) {
    return this.interesesService.create(createInteresDto, user.id);
  }

  @Get('mis-intereses')
  @Roles('cliente')
  findMine(@CurrentUser() user: { id: string; rol: string }) {
    return this.interesesService.findMine(user.id);
  }

  @Get()
  @Roles('administrador')
  findAll() {
    return this.interesesService.findAll();
  }

  @Patch(':id')
  @Roles('administrador', 'agente')
  update(@Param('id') id: string, @Body() updateInteresDto: UpdateInteresDto) {
    return this.interesesService.update(id, updateInteresDto);
  }
}
