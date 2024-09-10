import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Category {
  ADVENTURE = 'Adventure',
  CALSSICS = 'Classics',
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
}

export const BookSchema = SchemaFactory.createForClass(Book);
