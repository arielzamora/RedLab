import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Acceso no autorizado. Token no proporcionado.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'secret_key_123_utn_social',
      });
      // Attach the payload (user session details) to the request object
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Acceso no autorizado. Token inválido o expirado.');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    // Try cookie first
    const cookieToken = request.cookies?.['access_token'];
    if (cookieToken) {
      return cookieToken;
    }
    // Fallback to Bearer token in header
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
