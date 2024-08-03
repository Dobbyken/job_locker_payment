import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  MongoBase,
  MongoLocaleBase,
  MongoLocaleBaseSchema,
  TMongoAutoID,
} from './base.schema';

@Schema()
export class MongoProductsReviews {
  @Prop({ required: true })
  user_id_fk: string;

  @Prop({ type: Number, max: 5.0, min: -5.0, required: true })
  rating: number;

  @Prop()
  review: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

@Schema()
export class MongoProductsColors {
  @Prop()
  sku?: string;

  @Prop({ default: () => uuidv4(), type: String })
  id: TMongoAutoID;

  @Prop({ type: [MongoLocaleBaseSchema], required: true })
  name: MongoLocaleBase[];

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: [String], required: true })
  imgs: string[];
}

export const MongoProductsColorsSchema =
  SchemaFactory.createForClass(MongoProductsColors);

@Schema()
export class MongoProductsOptions {
  @Prop()
  sku?: string;

  @Prop({ type: [MongoLocaleBaseSchema], required: true })
  name: MongoLocaleBase[];

  @Prop({ type: [String], required: true })
  imgs: string[];

  @Prop({ type: [MongoProductsColorsSchema], required: true })
  colors: MongoProductsColors[];
}

export const MongoProductsOptionsSchema =
  SchemaFactory.createForClass(MongoProductsOptions);

@Schema({ collection: 'products' })
export class MongoProducts extends MongoBase {
  @Prop({ type: [MongoLocaleBaseSchema], required: true })
  name: MongoLocaleBase[];

  @Prop({ type: [MongoLocaleBaseSchema], required: true })
  details: MongoLocaleBase[];

  @Prop({ type: [MongoLocaleBaseSchema], required: true })
  description: MongoLocaleBase[];

  @Prop({ required: true })
  status: boolean;

  @Prop({ type: [MongoProductsReviews], required: false })
  reviews: MongoProductsReviews[];

  @Prop()
  sku?: string;

  @Prop({ type: [String], required: true })
  imgs: string[];

  @Prop({ type: [String], required: false })
  cats: string[];

  @Prop({ type: [MongoProductsOptionsSchema], required: true })
  options: MongoProductsOptions[];
}

export const MongoProductsSchema = SchemaFactory.createForClass(MongoProducts);
