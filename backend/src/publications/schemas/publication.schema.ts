import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PublicationDocument = Publication & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId | User;

  @Prop({ required: true })
  texto: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Publication {
  @Prop({ required: false })
  texto: string;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop()
  imgUrl: string; // Imagen opcional para la publicación

  // Relación con el usuario creador (Referencia a la colección 'User')
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId | User;

  // Array de IDs de usuarios que dieron Like
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  // Array de comentarios embebidos
  @Prop({ type: [CommentSchema], default: [] })
  comentarios: Comment[];

  @Prop({ default: true })
  activo: boolean; // Para realizar bajas lógicas (soft delete)
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
