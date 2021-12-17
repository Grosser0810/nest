import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
// import { userRolesResolver } from './utils/enums/roles.enum,';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      // resolvers: {
      //   UserRoles: userRolesResolver
      // }
    }),
    MongooseModule.forRoot('mongodb+srv://Hleb:Cfvehfq11@cluster0.nus36.mongodb.net/someName?retryWrites=true&w=majority'),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
