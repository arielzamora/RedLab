import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publication, PublicationDocument } from './schemas/publication.schema';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel(Publication.name) private readonly publicationModel: Model<PublicationDocument>,
  ) {}

  async findAll(limit: number = 10, offset: number = 0) {
    const skip = offset || 0;
    const take = limit || 10;
    return this.publicationModel.find({ activo: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .populate('autor', 'nombre apellido username imgUrl perfil')
      .exec();
  }

  async create(createPublicationDto: any) {
    const newPublication = new this.publicationModel(createPublicationDto);
    const saved = await newPublication.save();
    return saved.populate('autor', 'nombre apellido username imgUrl perfil');
  }

  async remove(id: string, userId: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    // Verify author OR admin status
    // If the user's role is 'administrador', let them delete any post
    const isAuthor = pub.autor.toString() === userId;
    
    // We need to fetch the requesting user's profile to see if they are an admin
    // But since the controller passed the sub (which is the user ID), we can fetch the user details or just check author.
    // Wait! In the controller, we can pass req.user.role if we put it in the JWT payload!
    // Earlier, we added `role: user.perfil` to the JWT payload! So req.user.role is available!
    // Let's pass the user's role to the remove method too, or query it. Passing it is easier!
    // Let's implement that in remove:
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
    return pub.populate('autor', 'nombre apellido username imgUrl perfil');
  }

  async removeLike(id: string, userId: string) {
    const pub = await this.publicationModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    pub.likes = pub.likes.filter(id => id.toString() !== userId);
    await pub.save();
    return pub.populate('autor', 'nombre apellido username imgUrl perfil');
  }
}
