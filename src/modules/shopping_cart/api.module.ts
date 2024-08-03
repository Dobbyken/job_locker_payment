import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShoppingCartController } from './api.controller';
import { ShoppingCartService } from './api.service';
import {
  MongoShoppingCart,
  MongoShoppingCartSchema,
} from '../../schema/shopping_cart.schema';
import {
  MongoProducts,
  MongoProductsSchema,
} from '../../schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongoShoppingCart.name, schema: MongoShoppingCartSchema },
      { name: MongoProducts.name, schema: MongoProductsSchema },
    ]),
  ],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
})
export class ShoppingCartModule {}
