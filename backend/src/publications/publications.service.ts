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

  async findOne(id: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub || !pub.activo) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    return pub.populate([
      { path: 'autor', select: 'nombre apellido username imgUrl perfil' },
      { path: 'comentarios.autor', select: 'nombre apellido username imgUrl perfil' }
    ]);
  }

  async getComments(id: string, limit: number = 5, offset: number = 0) {
    const pub = await this.publicationModel.findById(id).populate({
      path: 'comentarios.autor',
      select: 'nombre apellido username imgUrl perfil'
    });
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    // Sort comments descending by createdAt
    const sortedComments = [...pub.comentarios].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Paginate
    const paginatedComments = sortedComments.slice(offset, offset + limit);

    return {
      data: paginatedComments,
      total: sortedComments.length,
      limit,
      offset
    };
  }

  async updateComment(id: string, commentId: string, userId: string, newTexto: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const comment = pub.comentarios.find(c => (c as any)._id.toString() === commentId);
    if (!comment) {
      throw new NotFoundException('Comentario no encontrado.');
    }

    if (comment.autor.toString() !== userId) {
      throw new UnauthorizedException('No tienes permiso para editar este comentario.');
    }

    comment.texto = newTexto;
    comment.modificado = true;
    await pub.save();

    const populated = await this.publicationModel.populate(pub, {
      path: 'comentarios.autor',
      select: 'nombre apellido username imgUrl perfil'
    });
    
    return populated.comentarios.find(c => (c as any)._id.toString() === commentId);
  }

  async getPublicacionesPorUsuarioStats(fechaInicio?: string, fechaFin?: string) {
    const filter: any = { activo: true };
    if (fechaInicio || fechaFin) {
      filter.createdAt = {};
      if (fechaInicio) filter.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filter.createdAt.$lte = new Date(fechaFin);
    }

    return this.publicationModel.aggregate([
      { $match: filter },
      { $group: { _id: '$autor', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          nombre: '$user.nombre',
          apellido: '$user.apellido',
          count: 1,
        }
      },
      { $sort: { count: -1 } }
    ]).exec();
  }

  async getComentariosTotalesStats(fechaInicio?: string, fechaFin?: string) {
    const filter: any = { activo: true };
    
    const pipeline: any[] = [
      { $match: filter },
      { $unwind: '$comentarios' }
    ];

    if (fechaInicio || fechaFin) {
      const dateFilter: any = {};
      if (fechaInicio) dateFilter.$gte = new Date(fechaInicio);
      if (fechaFin) dateFilter.$lte = new Date(fechaFin);
      pipeline.push({
        $match: { 'comentarios.createdAt': dateFilter }
      });
    }

    pipeline.push(
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$comentarios.createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, fecha: '$_id', count: 1 } },
      { $sort: { fecha: 1 } }
    );

    return this.publicationModel.aggregate(pipeline).exec();
  }

  async getComentariosPorPublicacionStats(fechaInicio?: string, fechaFin?: string) {
    const filter: any = { activo: true };
    
    const pipeline: any[] = [
      { $match: filter },
      { $unwind: { path: '$comentarios', preserveNullAndEmptyArrays: true } }
    ];

    if (fechaInicio || fechaFin) {
      const dateFilter: any = {};
      if (fechaInicio) dateFilter.$gte = new Date(fechaInicio);
      if (fechaFin) dateFilter.$lte = new Date(fechaFin);
      
      pipeline.push({
        $match: {
          $or: [
            { 'comentarios.createdAt': dateFilter },
            { comentarios: null }
          ]
        }
      });
    }

    pipeline.push(
      {
        $group: {
          _id: '$_id',
          titulo: { $first: '$titulo' },
          count: {
            $sum: {
              $cond: [
                { $ifNull: ['$comentarios._id', false] },
                1,
                0
              ]
            }
          }
        }
      },
      { $project: { _id: 0, publicationId: '$_id', titulo: 1, count: 1 } },
      { $sort: { count: -1 } }
    );

    return this.publicationModel.aggregate(pipeline).exec();
  }
}
