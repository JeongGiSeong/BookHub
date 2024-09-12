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
    this.findAndValidateBook(id);
    const book = await this.bookModel.findById(id);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    return book;
  }

  async updateById(id: string, newBook: Book): Promise<Book> {
    try {
      const book = await this.findAndValidateBook(id);

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 책 ID입니다.');
    }
    const deletedBook = await this.bookModel.findByIdAndDelete(id).exec();
    if (!deletedBook) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    return { deleted: true };
  }

  public async findAndValidateBook(bookId: string): Promise<Book> {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('유효하지 않은 책 ID입니다.');
    }

    const book = await this.bookModel.findById(bookId).exec();
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    return book;
  }
}
