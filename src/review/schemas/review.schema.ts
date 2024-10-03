import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Book } from 'src/book/schemas/book.schema';

@Schema({
  timestamps: true,
})
export class Review extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book' })
  bookId: Book;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop()
  content: string;

  @Prop()
  rating: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  dislikes: mongoose.Types.ObjectId[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Review);
RatingSchema.index({ bookId: 1, userId: 1 }, { unique: true });
