import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('publications/estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get('publicaciones-por-usuario')
  getPublicacionesPorUsuario(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.publicationsService.getPublicacionesPorUsuarioStats(fechaInicio, fechaFin);
  }

  @Get('comentarios-totales')
  getComentariosTotales(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.publicationsService.getComentariosTotalesStats(fechaInicio, fechaFin);
  }

  @Get('comentarios-por-publicacion')
  getComentariosPorPublicacion(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.publicationsService.getComentariosPorPublicacionStats(fechaInicio, fechaFin);
  }
}
