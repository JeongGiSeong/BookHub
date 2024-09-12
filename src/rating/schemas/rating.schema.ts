import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Book } from 'src/book/schemas/book.schema';

@Schema({
  timestamps: true,
})
export class Rating extends Document {
  @Prop()
  rating: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  })
  book: Book;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
RatingSchema.index({ book: 1, user: 1 }, { unique: true });
