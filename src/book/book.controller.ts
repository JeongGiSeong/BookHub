import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/gurads/roles.guard';
import { Role } from 'src/auth/enums/role.enum';

@Controller('books')
export class BookController {
  private readonly logger = new Logger(BookController.name);
  constructor(private bookService: BookService) {}

  @Post()
  async createBook(@Body() body: { url: string }): Promise<Book> {
    return this.bookService.create(body.url);
  }

  @Get(':id')
  async getBookById(@Param('id') id: string): Promise<Book> {
    return this.bookService.findById(id);
  }

  @Get()
  async getAllBooks(@Query() query: ExpressQuery): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async updateBook(@Param('id') id: string, @Body() body: { url: string }): Promise<Book> {
    return this.bookService.updateById(id, body.url);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async deleteBook(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.bookService.deleteById(id);
  }
}
