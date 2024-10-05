import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Collection, Document } from 'mongoose';
import { Role } from '../enums/role.enum';
import { Book } from 'src/book/schemas/book.schema';
import { Review } from 'src/review/schemas/review.schema';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ unique: [true, '이메일 중복'] })
  email: string;

  @Prop()
  password: string;

  @Prop({
    type: [{ type: String, enum: Object.values(Role) }],
    default: [Role.USER],
  })
  role: Role[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    default: [],
  })
  reviews: Review[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    default: [],
  })
  bookmarks: Book[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    default: [],
  })
  collections: Collection[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
