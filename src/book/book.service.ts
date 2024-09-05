import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Book } from './schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Query } from 'express-serve-static-core';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<Book>
  ) {}

  async findAll(query: Query): Promise<Book[]> {
    const resPerPage = 2;
    const curPage = Number(query.page) || 1;
    const skip = (curPage - 1) * resPerPage;

    const keyword = query.keyword
      ? {
          title: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    return await this.bookModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);
  }

  async create(bookData): Promise<Book> {
    const res = await this.bookModel.create(bookData);
    return res;
  }

  async findById(id: string): Promise<Book> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException('Invalid book ID');
    }

    const book = await this.bookModel.findById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async updateById(id: string, bookData): Promise<Book> {
    return await this.bookModel.findByIdAndUpdate(id, bookData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id: string): Promise<Book> {
    return await this.bookModel.findByIdAndDelete(id);
  }
}
