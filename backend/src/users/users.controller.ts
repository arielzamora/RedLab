import { Controller, Get, Post, Patch, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../common/storage.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    const { nombre, apellido, descripcion } = updateUserDto;
    if (nombre && nombre.length > 50) {
      throw new BadRequestException('El nombre no puede superar los 50 caracteres.');
    }
    if (apellido && apellido.length > 50) {
      throw new BadRequestException('El apellido no puede superar los 50 caracteres.');
    }
    if (descripcion && descripcion.length > 200) {
      throw new BadRequestException('La descripción no puede superar los 200 caracteres.');
    }

    const payload = { ...updateUserDto };
    if (file) {
      payload.imgUrl = await this.storageService.uploadFile(file, req);
    }
    return this.usersService.update(id, payload);
  }
}
