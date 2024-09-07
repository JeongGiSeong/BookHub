import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './shema/review.schema';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';

import { Query } from 'express-serve-static-core';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<Review>
  ) {}

  create(createReviewDto: CreateReviewDto): Review | PromiseLike<Review> {
    throw new Error('Method not implemented.');
  }

  findAll(query: Query): Review[] | PromiseLike<Review[]> {
    throw new Error('Method not implemented.');
  }

  findById(id: string): Review | PromiseLike<Review> {
    throw new Error('Method not implemented.');
  }

  updateById(id: string, updateReviewDto: UpdateReviewDto): Review | PromiseLike<Review> {
    throw new Error('Method not implemented.');
  }

  deleteById(id: string): { deleted: boolean } | PromiseLike<{ deleted: boolean }> {
    throw new Error('Method not implemented.');
  }
}
