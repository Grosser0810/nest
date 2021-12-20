import { Module } from '@nestjs/common';
import { get, set } from 'lodash';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { decode } from './utils/jwt/jwt.utils';
import { ConfigModule } from '@nestjs/config';
// import { userRolesResolver } from './utils/enums/roles.enum,';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      context: ({ req, res }) => {
        const token = get(req, 'cookies.token');
        const user = token ? decode(token) : null;
        if (user) {
          set(req, 'user', user)
        }
        return { req, res };
      },
      // resolvers: {
      //   UserRoles: userRolesResolver
      // }
    }),
    MongooseModule.forRoot(process.env.DATABASE),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
}
