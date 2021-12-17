import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { nanoid } from 'nanoid'
import { CreateUserInput, User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(input: CreateUserInput) {
    const confirmToken = nanoid(32)
    return this.userModel.create({  ...input, confirmToken })
  }
}
