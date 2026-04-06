import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropiedadModule } from './propiedad/propiedad.module';

@Module({
  imports: [PropiedadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
