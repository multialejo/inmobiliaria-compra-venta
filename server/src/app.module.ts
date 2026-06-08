import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Canton } from './cantones/entities/canton.entity';
import { Parroquia } from './parroquias/entities/parroquia.entity';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Propiedad } from './propiedades/entities/propiedad.entity';
import { Interes } from './intereses/entities/interes.entity';
import { SeedModule } from './seed/seed.module';
import { CantonesModule } from './cantones/cantones.module';
import { ParroquiasModule } from './parroquias/parroquias.module';
import { PropiedadesModule } from './propiedades/propiedades.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { InteresesModule } from './intereses/intereses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'admin'),
        password: config.get<string>('DB_PASSWORD', 'admin123'),
        database: config.get<string>('DB_DATABASE', 'inmobiliaria'),
        entities: [Canton, Parroquia, Usuario, Propiedad, Interes],
        synchronize: true,
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    SeedModule,
    CantonesModule,
    ParroquiasModule,
    PropiedadesModule,
    UsuariosModule,
    AuthModule,
    ClientesModule,
    InteresesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
