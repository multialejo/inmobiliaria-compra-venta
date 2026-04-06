import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class UpdatePropiedadDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  precio?: number;
}
