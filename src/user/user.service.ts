import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { omit } from 'lodash';
import { CookieOptions } from 'express';
import { ConfirmUserInput, CreateUserInput, LoginInput, UpdateUserInput, User, UserDocument } from './user.schema';
import { Ctx } from 'src/utils/types/context.type';
import { decode, signJwt } from '../utils/jwt/jwt.utils';
import { JwtPayload } from 'jsonwebtoken';


const cookieOptions: CookieOptions = {
  domain: 'localhost',
  secure: true,
  sameSite: 'strict',
  httpOnly: true,
  path: '/',
};

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
  }

  async createUser(input: CreateUserInput) {
    const confirmToken = nanoid(32);
    return await this.userModel.create({ ...input, confirmToken });
  }

  async updateUser({ _id, ...otherField }: UpdateUserInput) {
    return  this.userModel.findByIdAndUpdate(_id, { ...otherField }, { new: true })
  }

  async confirmUser({ email, confirmToken }: ConfirmUserInput) {
    const user = await this.userModel.findOne({ email });
    if (!user || confirmToken !== user.confirmToken) {
      throw new Error('Email or confirm token are incorrect');
    }

    user.active = true;
    await user.save();

    return user;
  }

  async login({ email, password }: LoginInput, context: Ctx) {
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
    const { iat } = decode(jwt) as JwtPayload;
    const expiresDate = new Date((iat * 1000) + 60 * 60 * 24 * 1000);
    context.res.cookie('token', jwt, { ...cookieOptions, expires: expiresDate });
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
