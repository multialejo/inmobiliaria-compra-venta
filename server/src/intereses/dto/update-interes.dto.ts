import { IsEnum } from 'class-validator';
import { EstadoInteres } from '../entities/interes.entity';

export class UpdateInteresDto {
  @IsEnum(EstadoInteres)
  estado: EstadoInteres;
}
