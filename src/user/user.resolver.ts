import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { ConfirmUserInput, CreateUserInput, LoginInput, UpdateUserInput, User } from './user.schema';
import { Ctx } from 'src/utils/types/context.type';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {
  }

  @Mutation(() => User)
  async registerUser(@Args('input') input: CreateUserInput) {
    return this.userService.createUser(input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  async updateUser(@Args('input') input: UpdateUserInput) {
    return this.userService.updateUser(input);
  }

  @Mutation(() => User)
  async confirmUser(@Args('input') input: ConfirmUserInput) {
    return this.userService.confirmUser(input);
  }

  @Query(() => User, { nullable: true })
  async login(@Args('input') input: LoginInput, @Context() context: Ctx) {
    return this.userService.login(input, context);
  }

  @UseGuards(AuthGuard)
  @Query(() => User, { nullable: true })
  async currentUser(@Context() context: Ctx) {
    return context.req.user;
  }

  @UseGuards(AuthGuard)
  @Query(() => User, { nullable: true })
  async logout(@Context() context: Ctx) {
    return this.userService.logout(context);
  }

  @UseGuards(AuthGuard)
  @Query(() => [User])
  async getUsers() {
    return this.userService.getUsers();
  }
}
