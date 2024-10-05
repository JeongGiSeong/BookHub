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

  public async create(url: string): Promise<Book> {
    const book = await this.scrapeBook(url);
    const res = await this.bookModel.create(book);
    return res;
  }

  // TODO: 저자, 출판사, 카테고리 등 다른 필드에 대한 검색 기능을 추가
  // 출판일, 평점, 제목 순으로 정렬할 수 있는 옵션을 제공
  public async findAll(query: Query): Promise<Book[]> {
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

  public async findById(id: string): Promise<Book> {
    return await this.findAndValidateBook(id);
  }

  public async updateById(id: string, url: string): Promise<Book> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 책 ID입니다.');
    }

    const newBook = await this.scrapeBook(url);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = newBook.toObject(); // _id 필드를 제외한 나머지 필드만 추출
    const updatedBook = await this.bookModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBook) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    return updatedBook;
  }

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 책 ID입니다.');
    }
    const deletedBook = await this.bookModel.findByIdAndDelete(id);
    if (!deletedBook) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    return { deleted: true };
  }

  public async findAndValidateBook(bookId: string): Promise<Book> {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('유효하지 않은 책 ID입니다.');
    }

    const book = await this.bookModel.findById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    return book;
  }

  public async scrapeBook(url: string): Promise<Book> {
    // TODO: 유효한 URL인지 검사
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $('.gd_titArea h2.gd_name').text().trim();
      const subtitle = $('h3.gd_nameE').text().trim();
      const author = $('span.gd_auth').text().trim();
      const coverImage = $('div.gd_img img').attr('src');
      const publisher = $('span.gd_pub').text().trim();
      const publishedAt = $('span.gd_date').text().trim();
      const category = $('#yLocation > div > div:nth-child(6) > a').text().trim();

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
