import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Book } from 'src/book/schemas/book.schema';

@Schema({
  timestamps: true,
})
export class Review extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  bookId: Book;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop()
  content: string;

  @Prop()
  rating: number;

  @Prop()
  likes: number;

  @Prop()
  dislikes: number;
}

export const RatingSchema = SchemaFactory.createForClass(Review);
RatingSchema.index({ book: 1, user: 1 }, { unique: true });
