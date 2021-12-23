import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { nanoid } from 'nanoid'
import { omit } from 'lodash'
import { CookieOptions } from 'express';
import { ConfirmUserInput, CreateUserInput, LoginInput, User, UserDocument } from './user.schema';
import { Ctx } from 'src/utils/types/context.type';
import { signJwt } from '../utils/jwt/jwt.utils';


const cookieOptions: CookieOptions = {
  domain: 'localhost',
  secure: true,
  sameSite: 'strict',
  httpOnly: true,
  path: '/'
}

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(input: CreateUserInput) {
    const confirmToken = nanoid(32)
    return this.userModel.create({  ...input, confirmToken })
  }

  async confirmUser({ email, confirmToken } : ConfirmUserInput) {
    const user = await this.userModel.findOne({ email });
    if (!user || confirmToken !== user.confirmToken) {
      throw new Error('Email or confirm token are incorrect')
    }

    user.active = true;
    await user.save();

    return user;
  }

  async login({ email, password } : LoginInput, context: Ctx) {
    const user = await this.userModel
      .findOne({ email })
      .select('-__v -confirmToken');

    const checkPassword = await user?.comparePassword(password);

    if (!user || !checkPassword) {
      throw new Error('Invalid email or password');
    }
    if (!user.active) {
      throw new Error('Please confirm your email address');
    }

    const jwt = signJwt(omit(user.toJSON(), ['password', 'active']));
    context.res.cookie('token', jwt, cookieOptions);

    return user;
  }

  async logout(context: Ctx) {
    context.res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
    return null;
  }

  async getUsers() {
    return await this.userModel.find().exec();
  }
}
