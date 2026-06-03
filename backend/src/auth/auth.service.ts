import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(registroDto: any, file?: any, req?: any) {
    const { nombre, apellido, correo, username, password, fechaNacimiento, descripcion, perfil } = registroDto;

    // Check duplicate email
    const existingEmail = await this.usersService.findByEmail(correo);
    if (existingEmail) {
      throw new ConflictException('El correo ya está registrado.');
    }

    // Check duplicate username
    const existingUsername = await this.usersService.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate profile picture URL
    let imgUrl = '';
    if (file && req) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imgUrl = `${baseUrl}/uploads/${file.filename}`;
    }

    // Create user
    const createdUser = await this.usersService.create({
      nombre,
      apellido,
      correo,
      username,
      password: hashedPassword,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
      descripcion,
      perfil: perfil || 'usuario',
      imgUrl,
    });

    // Return user without password
    const userObj = createdUser.toObject();
    delete userObj.password;
    return userObj;
  }

  async login(loginDto: any) {
    const { username, password } = loginDto;

    // Find user by username or email
    const user = await this.usersService.findByUsername(username) || await this.usersService.findByEmail(username);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // Generate JWT
    const payload = { sub: user._id, username: user.username, email: user.correo, role: user.perfil };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        username: user.username,
        imgUrl: user.imgUrl,
        perfil: user.perfil,
        descripcion: user.descripcion,
        fechaNacimiento: user.fechaNacimiento,
      },
    };
  }
}
