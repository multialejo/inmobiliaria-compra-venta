import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePropiedadDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  direccion: string;

  @IsNumber()
  precio: number;
}
