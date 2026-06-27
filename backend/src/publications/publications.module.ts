import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicationsController } from './publications.controller';
import { EstadisticasController } from './estadisticas.controller';
import { PublicationsService } from './publications.service';
import { Publication, PublicationSchema } from './schemas/publication.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publication.name, schema: PublicationSchema }])
  ],
  controllers: [PublicationsController, EstadisticasController],
  providers: [PublicationsService]
})
export class PublicationsModule {}
