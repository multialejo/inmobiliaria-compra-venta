import { IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCompraDto {
  @IsUUID()
  propiedad_id: string;

  @IsNumber()
  @IsOptional()
  precio_acordado?: number;

  @IsString()
  @IsOptional()
  metodo_pago?: string;
}
