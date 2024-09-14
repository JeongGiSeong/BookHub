import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Book } from './schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';

import { Query } from 'express-serve-static-core';
import * as cheerio from 'cheerio';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<Book>
  ) {}

  async create(url: string): Promise<Book> {
    const book = await this.scrapeBook(url);
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

  async updateById(id: string, url: string): Promise<Book> {
    const book = await this.findAndValidateBook(id);

    try {
      const newBook = await this.scrapeBook(url);

      // _id 필드를 제거한 새로운 객체 생성
      const updateData = { ...newBook.toObject() };

      Object.assign(book, updateData);
      return book.save();
    } catch (error) {
      if (error) {
        this.logger.error('책을 업데이트하는데 실패했습니다.', error.stack);
        throw new HttpException('책을 업데이트하는데 실패했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
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

  private async scrapeBook(url: string) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $('.gd_titArea h2.gd_name').text().trim();
      const subtitle = $('h3.gd_nameE').text().trim();
      const author = $('span.gd_auth').text().trim();
      const coverImage = $('div.gd_img img').attr('src');
      const publisher = $('span.gd_pub').text().trim();
      const publishedAt = $('span.gd_date').text().trim();
      const category = $('.yLocaSet .yLocaDepth').eq(1).text().trim();

      const book = new this.bookModel({
        title,
        subtitle,
        author,
        category,
        coverImage,
        publisher,
        publishedAt,
        yes24url: url,
      });

      return book;
    } catch (error) {
      if (error) {
        this.logger.error('책을 불러오는데 실패했습니다.', error.stack);
        throw new HttpException('책을 불러오는데 실패했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
