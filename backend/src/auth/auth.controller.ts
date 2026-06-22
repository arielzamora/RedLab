import { Controller, Post, Body, UseInterceptors, UploadedFile, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registro(
    @Body() registroDto: any,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    return this.authService.registro(registroDto, file, req);
  }

  @Post('login')
  async login(
    @Body() loginDto: any,
    @Res({ passthrough: true }) res: any
  ) {
    const result = await this.authService.login(loginDto);
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true, // Secure is required for sameSite: 'none'
      sameSite: 'none', // Allow cookie to be sent on cross-origin requests
      maxAge: 900000, // 15 minutes
    });
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { success: true };
  }

  @Post('autorizar')
  @UseGuards(AuthGuard)
  async autorizar(@Req() req: any) {
    return this.authService.autorizar(req.user.sub);
  }

  @Post('refrescar')
  @UseGuards(AuthGuard)
  async refrescar(
    @Req() req: any,
    @Res({ passthrough: true }) res: any
  ) {
    const result = await this.authService.refrescar(req.user);
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 900000, // 15 minutes
    });
    return result;
  }
}
