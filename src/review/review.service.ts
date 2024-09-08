import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './shema/review.schema';
import mongoose, { Model } from 'mongoose';
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

  async findAll(query: Query): Promise<Review[]> {
    const resPerPage = 10;
    const curPage = Number(query.page) || 1;
    const skip = (curPage - 1) * resPerPage;

    const keyword = query.keyword
      ? {
          title: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    return await this.reviewModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);
  }

  async findById(id: string): Promise<Review> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('리뷰 ID가 유효하지 않습니다.');
    }

    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new BadRequestException('리뷰를 찾을 수 없습니다.');
    }

    return review;
  }

  async updateById(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    return await this.reviewModel.findByIdAndUpdate(id, updateReviewDto, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    await this.reviewModel.findByIdAndDelete(id);
    return { deleted: true };
  }
}
