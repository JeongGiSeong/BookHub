import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Module } from '@nestjs/common';
import { ReviewSchema } from './shema/review.schema';
import { ReviewController } from './review.controller';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [AuthModule, BookModule, MongooseModule.forFeature([{ name: 'Review', schema: ReviewSchema }])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
