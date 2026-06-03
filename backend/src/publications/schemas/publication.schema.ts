import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PublicationDocument = Publication & Document;

@Schema({ timestamps: true })
export class Publication {
  @Prop({ required: true })
  texto: string;

  @Prop()
  imgUrl: string; // Imagen opcional para la publicación

  // Relación con el usuario creador (Referencia a la colección 'User')
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId | User;

  // Array de IDs de usuarios que dieron Like
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ default: true })
  activo: boolean; // Para realizar bajas lógicas (soft delete)
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
