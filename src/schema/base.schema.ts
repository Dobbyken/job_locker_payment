import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type TMongoAutoID = string;

@Schema()
export class MongoBase extends Document {
  @Prop({ default: () => uuidv4() })
  id: TMongoAutoID;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MongoBaseSchema = SchemaFactory.createForClass(MongoBase);

@Schema()
export class MongoLocaleBase extends Document {
  @Prop({ default: 'default' })
  locale: string;

  @Prop({ required: true })
  value: string;
}

export const MongoLocaleBaseSchema =
  SchemaFactory.createForClass(MongoLocaleBase);
