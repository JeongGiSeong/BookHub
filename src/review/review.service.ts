import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './shema/review.schema';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';

import { Query } from 'express-serve-static-core';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<Review>
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    const { content, bookId } = createReviewDto;
    const review = new this.reviewModel({
      content,
      book: bookId,
      user: user._id,
    });
    return review.save();
  }

  findAll(query: Query): Promise<Review[]> {
    throw new Error('Method not implemented.');
  }

  findById(id: string): Promise<Review> {
    throw new Error('Method not implemented.');
  }

  updateById(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    throw new Error('Method not implemented.');
  }

  deleteById(id: string): Promise<{ deleted: boolean }> {
    throw new Error('Method not implemented.');
  }
}
