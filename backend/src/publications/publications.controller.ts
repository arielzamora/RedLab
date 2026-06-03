import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('publications')
@UseGuards(AuthGuard)
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  findAll(@Query('limit') limit: string, @Query('offset') offset: string) {
    return this.publicationsService.findAll(+limit, +offset);
  }

  @Post()
  create(@Req() req: any, @Body() createPublicationDto: any) {
    const payload = { ...createPublicationDto, autor: req.user.sub };
    return this.publicationsService.create(payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationsService.remove(id);
  }

  @Post(':id/like')
  addLike(@Req() req: any, @Param('id') id: string) {
    return this.publicationsService.addLike(id, req.user.sub);
  }

  @Delete(':id/like')
  removeLike(@Req() req: any, @Param('id') id: string) {
    return this.publicationsService.removeLike(id, req.user.sub);
  }
}
