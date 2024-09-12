import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Book, Category } from './schemas/book.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ScraperService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<Book>
  ) {}

  async scrapeBook(url: string) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $('.gd_titArea h2.gd_name').text();
      const subtitle = $('h3.gd_nameE').text();
      const author = $('span.gd_auth').text();
      const coverImage = $('div.gd_img img').attr('src');
      const publisher = $('span.gd_pub').text();
      const publishedAt = $('span.gd_date').text();

      const book = new this.bookModel({
        title,
        subtitle,
        author,
        category: Category.ADVENTURE,
        coverImage,
        publisher,
        publishedAt,
        yes24url: url,
      });

      return book;
    } catch (error) {
      if (error) {
        console.error(error);
        throw new HttpException('Failed to scrape book', 500);
      }
    }
  }
}
