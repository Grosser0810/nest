import { Request, Response } from 'express';
import { User } from 'src/user/user.schema';

export type Ctx = {
  req: Request & { user?: Pick<User, 'email'> };
  res: Response
}