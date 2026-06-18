/**
 * @file main.ts
 * @brief Punto de entrada y configuración global del servidor NestJS.
 * 
 * @section bootstrap Inicialización del Servidor
 * Inicia la aplicación NestJS a partir de `AppModule`. Carga las variables de entorno mediante `ConfigService`.
 * 
 * @section api Configuración de la API y CORS
 * - Define el prefijo global de rutas como `api`, de modo que todos los endpoints comiencen con `/api/...`.
 * - Habilita CORS (Cross-Origin Resource Sharing) restringiendo los accesos únicamente al origen del cliente
 *   (configurado en `CORS_ORIGIN`, por defecto http://localhost:5173), permitiendo el envío de credenciales/cookies
 *   y restringiendo los métodos HTTP permitidos a `GET`, `POST`, `PATCH` y `DELETE`.
 * 
 * @section seguridad Seguridad y validaciones
 * - Middleware `helmet` integrado para asegurar cabeceras HTTP sensibles.
 * - Middleware `cookieParser` integrado para la lectura/escritura de cookies.
 * - `ValidationPipe` configurado globalmente para forzar la validación estricta de DTOs,
 *   limpiando atributos no declarados (whitelist: true) y realizando conversiones de tipo implícitas.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(configService.get<number>('PORT', 3000));
}
void bootstrap();
