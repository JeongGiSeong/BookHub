import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { BookSchema } from './schemas/book.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }])],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
