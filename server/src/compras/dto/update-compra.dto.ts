import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { EstadoCompra } from '../entities/compra.entity';

export class UpdateCompraDto {
  @IsEnum(EstadoCompra)
  @IsOptional()
  estado?: EstadoCompra;

  @IsNumber()
  @IsOptional()
  precio_acordado?: number;

  @IsString()
  @IsOptional()
  metodo_pago?: string;
}
