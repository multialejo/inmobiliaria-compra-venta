import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Canton } from './cantones/entities/canton.entity';
import { Parroquia } from './parroquias/entities/parroquia.entity';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Propiedad } from './propiedades/entities/propiedad.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'admin',
      password: 'admin123',
      database: 'inmobiliaria',
      entities: [Canton, Parroquia, Usuario, Propiedad],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
