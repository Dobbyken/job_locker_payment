import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './api.controller';
import { ProductsService } from './api.service';
import {
  MongoProducts,
  MongoProductsSchema,
} from '../../schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongoProducts.name, schema: MongoProductsSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
