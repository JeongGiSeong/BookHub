import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';

import { Query as ExpressQuery } from 'express-serve-static-core';
import { ScraperService } from './scraper.service';
import { CreateBookDto } from './dto/create-book.dto';

@Controller('books')
export class BookController {
  constructor(
    private bookService: BookService,
    private scraperService: ScraperService
  ) {}

  @Get(':id')
  async getBookById(@Param('id') id: string): Promise<Book> {
    return this.bookService.findById(id);
  }

  @Get()
  // @Roles(Role.Admin, Role.Manager)
  // @UseGuards(AuthGuard(), RolesGuard)
  async getAllBooks(@Query() query: ExpressQuery): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  @Post()
  // @UseGuards(AuthGuard())
  async createBook(@Body() createBookDto: CreateBookDto): Promise<Book> {
    const { url } = createBookDto;
    const bookData = await this.scraperService.scrapeBook(url);
    return this.bookService.create(bookData);
  }
}
