import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class RegisterClienteDto {
  @IsString()
  nombre: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  cedula?: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}
