import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Review } from 'src/review/schemas/review.schema';

@Schema({
  timestamps: true,
})
export class Book extends Document {
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

  @Prop({ unique: [true, 'Duplicated Book'] })
  yes24url: string;

  @Prop()
  publisher: string;

  @Prop()
  publishedAt: string;

  @Prop()
  rating: { avg: number; count: number };

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] })
  reviews: Review[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  bookmarks: User[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.index({ title: 1, author: 1 }, { unique: true });
