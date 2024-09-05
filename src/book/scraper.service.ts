import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Book } from './schemas/book.schema';

@Injectable()
export class ScraperService {
  async scrapeBook(url: string) {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $('h2.gd_name').text();
    const subtitle = $('h3.gd_nameE').text();
    const author = $('span.gd_auth').text();
    const coverImage = $('div.gd_img img').attr('src');
    const publisher = $('span.gd_pub').text();
    const publishedAt = $('span.gd_date').text();

    const book = new Book();
    book.title = title;
    book.subtitle = subtitle;
    book.author = author;
    book.coverImage = coverImage;
    book.publisher = publisher;
    book.publishedAt = publishedAt;
    book.yes24url = url;

    return book;
  }
}
