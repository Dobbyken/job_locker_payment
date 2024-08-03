import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoBase } from './base.schema';

@Schema({ collection: 'shopping_cart' })
export class MongoShoppingCart extends MongoBase {
  @Prop({ required: true })
  user_id_fk: string;

  @Prop({ type: [Object], required: true })
  cart: MongoCart[];
}

export const MongoShoppingCartSchema =
  SchemaFactory.createForClass(MongoShoppingCart);

@Schema()
export class MongoCart extends Document {
  @Prop({ required: true })
  product_id: string;

  @Prop({ required: true })
  color_id: string;

  @Prop({ type: Number, required: true })
  quantity: number;
}

export const MongoCartSchema = SchemaFactory.createForClass(MongoCart);
