import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoBase } from './base.schema';
import { Role } from 'src/middleware/auth/role.enum';

// export enum UserRole {
//   PUBLIC = 'Public',
//   MEMBER = 'Member',
//   VIP = 'VIP',
//   ADMIN_MASTER = 'Admin_Master',
// }

export type UserDocument = User & Document;

@Schema({ collection: 'users' })
export class User extends MongoBase {
  @Prop({ required: true })
  name: string;

  @Prop()
  firstname?: string;

  @Prop()
  lastname?: string;

  @Prop({ type: String, enum: Role, default: Role.MEMBER })
  role: Role;

  @Prop()
  isd_code?: number;

  @Prop({ unique: true })
  phone?: number;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ unique: true, required: true })
  account: string;

  @Prop()
  password?: string;

  @Prop({ default: true })
  status?: boolean;

  @Prop({ default: true })
  permission?: boolean;

  @Prop()
  birthday?: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop()
  remark?: string;

  @Prop()
  otp?: number;

  @Prop()
  otpExpiry?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
