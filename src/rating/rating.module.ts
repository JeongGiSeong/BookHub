import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Module } from '@nestjs/common';
import { RatingSchema } from './schemas/rating.schema';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [AuthModule, BookModule, MongooseModule.forFeature([{ name: 'Rating', schema: RatingSchema }])],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
