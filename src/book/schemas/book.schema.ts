import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Review } from 'src/review/schemas/review.schema';

@Schema({
  timestamps: true,
})
export class Book extends Document {
  @Prop({ unique: [true, '책 중복'] })
  yes24url: string;

  @Prop()
  title: string;

  @Prop()
  subtitle: string;

  @Prop()
  author: string;

  @Prop()
  category: string;

  @Prop()
  coverImage: string;

  @Prop()
  publisher: string;

  @Prop()
  publishedAt: string;

  @Prop()
  avgRating: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] })
  reviews: Review[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  bookmarks: User[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);
