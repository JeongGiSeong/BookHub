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

  async create(book: Book): Promise<Book> {
    const res = await this.bookModel.create(book);
    return res;
  }

  async findAll(query: Query): Promise<Book[]> {
    const resPerPage = 10;
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

  async findById(id: string): Promise<Book> {
    this.validateBookId(id);
    const book = await this.bookModel.findById(id);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    return book;
  }

  async updateById(id: string, newBook: Book): Promise<Book> {
    try {
      const book = await this.bookModel.findById(id).exec();
      if (!book) {
        throw new NotFoundException('책을 찾을 수 없습니다.');
      }
      await this.validateBookExist(id);

      // _id 필드를 제거한 새로운 객체 생성
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...updateData } = newBook.toObject();

      Object.assign(book, updateData);
      return book.save();
    } catch (error) {
      console.error(error);
    }
  }

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    this.validateBookId(id);
    await this.validateBookExist(id);
    await this.bookModel.findByIdAndDelete(id);
    return { deleted: true };
  }

  validateBookId(id: string): void {
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId) {
      throw new BadRequestException('책 ID가 유효하지 않습니다.');
    }
  }

  async validateBookExist(id: string): Promise<void> {
    const book = await this.bookModel.findById(id);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
  }
}
