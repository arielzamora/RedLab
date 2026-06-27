import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(correo: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ correo }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, { password: 0 }).exec(); // Exclude password from general listings
  }

  async create(createUserDto: any): Promise<UserDocument> {
    if (createUserDto.password && !createUserDto.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    }
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async disableUser(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, { activo: false }, { new: true }).exec();
  }

  async enableUser(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, { activo: true }, { new: true }).exec();
  }

  async update(id: string, updateUserDto: any): Promise<UserDocument | null> {
    if (updateUserDto.password && !updateUserDto.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }
}
