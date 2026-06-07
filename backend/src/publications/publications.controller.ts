import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('publications')
@UseGuards(AuthGuard)
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  findAll(
    @Query('limit') limit?: string, 
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
    @Query('autor') autor?: string
  ) {
    return this.publicationsService.findAll(
      limit ? +limit : 10, 
      offset ? +offset : 0, 
      sortBy || 'fecha',
      autor
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagen', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `post-${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  create(
    @Req() req: any, 
    @Body() createPublicationDto: any,
    @UploadedFile() file: any
  ) {
    const payload = { ...createPublicationDto, autor: req.user.sub };
    if (file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      payload.imgUrl = `${baseUrl}/uploads/${file.filename}`;
    }
    return this.publicationsService.create(payload);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.publicationsService.removeWithRole(id, req.user.sub, req.user.role);
  }

  @Post(':id/like')
  addLike(@Req() req: any, @Param('id') id: string) {
    return this.publicationsService.addLike(id, req.user.sub);
  }

  @Delete(':id/like')
  removeLike(@Req() req: any, @Param('id') id: string) {
    return this.publicationsService.removeLike(id, req.user.sub);
  }

  @Post(':id/comments')
  addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body('texto') texto: string
  ) {
    return this.publicationsService.addComment(id, req.user.sub, texto);
  }
}
