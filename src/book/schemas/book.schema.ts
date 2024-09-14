import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Category {
  ADVENTURE = 'Adventure',
  CLASSICS = 'Classics',
  CRIME = 'Crime',
  FANTASY = 'Fantasy',
}

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
  category: Category;

  @Prop()
  coverImage: string;

  @Prop({ unique: [true, 'Duplicated Book'] })
  yes24url: string;

  @Prop()
  publisher: string;

  @Prop()
  publishedAt: string;

  @Prop({
    type: [
      {
        rating: Number,
        content: String,
        userId: String,
        likes: [{ userId: String }],
        disklikes: [{ userId: String }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  })
  reviews: {
    rating: number;
    content: string;
    userId: string;
    likes: { userId: string }[];
    dislikes: { userId: string }[];
    createdAt?: Date;
    updatedAt?: Date;
  }[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
