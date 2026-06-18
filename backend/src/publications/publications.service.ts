import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publication, PublicationDocument } from './schemas/publication.schema';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel(Publication.name) private readonly publicationModel: Model<PublicationDocument>,
  ) {}

  async findAll(limit: number = 10, offset: number = 0, sortBy: string = 'fecha', autorId?: string) {
    const skip = offset || 0;
    const take = limit || 10;

    const filter: any = { activo: true };
    if (autorId) {
      filter.autor = { $in: [autorId, new Types.ObjectId(autorId)] };
    }

    const aggregationPipeline: any[] = [{ $match: filter }];

    if (sortBy === 'likes') {
      aggregationPipeline.push(
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: -1, createdAt: -1 } }
      );
    } else {
      aggregationPipeline.push({ $sort: { createdAt: -1 } });
    }

    aggregationPipeline.push({ $skip: skip }, { $limit: take });

    const results = await this.publicationModel.aggregate(aggregationPipeline).exec();

    return this.publicationModel.populate(results, [
      { path: 'autor', select: 'nombre apellido username imgUrl perfil' },
      { path: 'comentarios.autor', select: 'nombre apellido username imgUrl perfil' }
    ]);
  }

  async create(createPublicationDto: any) {
    const { titulo, descripcion } = createPublicationDto;
    if (titulo && titulo.length > 100) {
      throw new BadRequestException('El título no puede superar los 100 caracteres.');
    }
    if (descripcion && descripcion.length > 500) {
      throw new BadRequestException('La descripción no puede superar los 500 caracteres.');
    }

    const newPublication = new this.publicationModel(createPublicationDto);
    const saved = await newPublication.save();
    return saved.populate([
      { path: 'autor', select: 'nombre apellido username imgUrl perfil' },
      { path: 'comentarios.autor', select: 'nombre apellido username imgUrl perfil' }
    ]);
  }

  async remove(id: string, userId: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    const isAuthor = pub.autor.toString() === userId;
    pub.activo = false; // Soft delete
    return pub.save();
  }

  async removeWithRole(id: string, userId: string, role: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    const isAuthor = pub.autor.toString() === userId;
    const isAdmin = role === 'administrador';
    if (!isAuthor && !isAdmin) {
      throw new UnauthorizedException('No tienes permiso para eliminar esta publicación.');
    }
    pub.activo = false; // Soft delete
    return pub.save();
  }

  async addLike(id: string, userId: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    if (!pub.likes.includes(userId as any)) {
      pub.likes.push(userId as any);
      await pub.save();
    }
    return pub.populate([
      { path: 'autor', select: 'nombre apellido username imgUrl perfil' },
      { path: 'comentarios.autor', select: 'nombre apellido username imgUrl perfil' }
    ]);
  }

  async removeLike(id: string, userId: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    pub.likes = pub.likes.filter(id => id.toString() !== userId);
    await pub.save();
    return pub.populate([
      { path: 'autor', select: 'nombre apellido username imgUrl perfil' },
      { path: 'comentarios.autor', select: 'nombre apellido username imgUrl perfil' }
    ]);
  }

  async addComment(id: string, userId: string, texto: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    pub.comentarios.push({
      autor: userId as any,
      texto,
      createdAt: new Date()
    } as any);
    await pub.save();
    return pub.populate([
      { path: 'autor', select: 'nombre apellido username imgUrl perfil' },
      { path: 'comentarios.autor', select: 'nombre apellido username imgUrl perfil' }
    ]);
  }
}
