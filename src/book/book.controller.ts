import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';

import { Query as ExpressQuery } from 'express-serve-static-core';
import { ScraperService } from './scraper.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

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
  async getAllBooks(@Query() query: ExpressQuery): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  @Post()
  // @Roles(Role.Admin, Role.Manager)
  // @UseGuards(AuthGuard())
  async createBook(@Body() createBookDto: CreateBookDto): Promise<Book> {
    const { url } = createBookDto;
    const book = await this.scraperService.scrapeBook(url);
    return this.bookService.create(book);
  }

  @Patch(':id')
  // @Roles(Role.Admin)
  // @UseGuards(AuthGuard())
  async updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto): Promise<Book> {
    const { url } = updateBookDto;
    const book = await this.scraperService.scrapeBook(url);
    return this.bookService.updateById(id, book);
  }

  @Delete(':id')
  // @Roles(Role.Admin)
  // @UseGuards(AuthGuard())
  async deleteBook(@Param('id') id: string): Promise<Book> {
    return this.bookService.deleteById(id);
  }
}
