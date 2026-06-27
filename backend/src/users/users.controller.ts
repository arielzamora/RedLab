import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../common/storage.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  async create(@Body() createUserDto: any) {
    const { correo, username } = createUserDto;
    
    const existingEmail = await this.usersService.findByEmail(correo);
    if (existingEmail) {
      throw new ConflictException('El correo ya está registrado.');
    }

    const existingUsername = await this.usersService.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso.');
    }

    return this.usersService.create(createUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async disable(@Param('id') id: string) {
    return this.usersService.disableUser(id);
  }

  @Post(':id/enable')
  @UseGuards(AuthGuard, AdminGuard)
  async enable(@Param('id') id: string) {
    return this.usersService.enableUser(id);
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
