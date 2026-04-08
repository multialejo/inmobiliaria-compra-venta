import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { TipoInmueble, EstadoPropiedad } from '../entities/propiedad.entity';

export class CreatePropiedadDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  precio: number;

  @IsEnum(TipoInmueble)
  tipo_inmueble: TipoInmueble;

  @IsOptional()
  @IsEnum(EstadoPropiedad)
  estado?: EstadoPropiedad;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @IsNumber()
  superficie_m2: number;

  @IsNumber()
  canton_id: number;

  @IsNumber()
  parroquia_id: number;

  @IsUUID()
  agente_id: string;
}
