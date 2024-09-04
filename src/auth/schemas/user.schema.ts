import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../enums/role.enum';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ unique: [true, 'Duplicated Email'] })
  email: string;

  @Prop()
  password: string;

  @Prop({
    type: [{ type: String, enum: Object.values(Role) }],
    default: [Role.User],
  })
  role: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
