import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { genSalt, hash, compare } from 'bcrypt';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { TUserRoles } from '../utils/types/roles.types';

@Schema()
@ObjectType()
export class User {
  @Field(() => ID)
  _id: number;

  @Prop({ required: true, unique: true })
  @Field()
  email: string

  @Prop({ required: true })
  @Field()
  firstName: string;

  @Prop({ required: true })
  @Field()
  lastName: string;

  @Prop({ required: false, default: ['user'] })
  @Field(() => [String], { nullable: true })
  roles: TUserRoles[];

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  confirmToken: string;

  @Prop({ required: true, default: false })
  active: boolean;

  comparePassword: (candidatePassword: string) => boolean;
}


export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });

UserSchema.pre('save', async function (next) {
  let user = this as UserDocument;

  if (!user.isModified('password')) return next();

  const salt = await genSalt(10);
  user.password = await hash(user.password, salt);

  return next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  const { password } = this as UserDocument;
  return compare(candidatePassword, password).catch(e => false);
}

@InputType()
export class CreateUserInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => [String])
  roles: TUserRoles[];

  @Field()
  password: string;
}

@InputType()
export class ConfirmUserInput {
  @Field()
  email: string;

  @Field()
  confirmToken: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}