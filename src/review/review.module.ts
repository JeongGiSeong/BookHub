import { BookService } from '../../src/book/book.service';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../src/auth/auth.module';
import { Module } from '@nestjs/common';
import { ReviewSchema } from './shema/review.schema';
import { ReviewController } from './review.controller';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: 'Review', schema: ReviewSchema }])],
  controllers: [ReviewController],
  providers: [ReviewService, BookService],
})
export class ReviewModule {}
