import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './modules/products/api.module';
import { ShoppingCartModule } from './modules/shopping_cart/api.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UserModule } from './modules/user/api.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MongoDB_Url, {
      user: process.env.MongoDB_User,
      pass: process.env.MongoDB_Pw,
      dbName: process.env.MongoDB_DB_Name,
    }),
    ProductsModule,
    ShoppingCartModule,
    UserModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
