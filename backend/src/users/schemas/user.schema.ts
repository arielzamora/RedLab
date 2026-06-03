import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // TODO: Implementar lógica (hashing de contraseña)

  @Prop()
  fechaNacimiento: Date;

  @Prop()
  descripcion: string;

  @Prop({ default: 'USER' })
  perfil: string;

  @Prop()
  imgUrl: string; // TODO: Implementar lógica (subida de archivos - imágenes de perfil)

  @Prop({ default: true })
  activo: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
