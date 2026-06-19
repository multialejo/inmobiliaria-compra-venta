import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class RegisterClienteDto {
  @IsString()
  nombre: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsString({ message: 'El teléfono es obligatorio' })
  telefono: string;

  @IsString({ message: 'La cédula es obligatoria' })
  cedula: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}
