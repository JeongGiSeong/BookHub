import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './shema/review.schema';
import mongoose, { Model } from 'mongoose';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';

import { Query } from 'express-serve-static-core';
import { BookService } from 'src/book/book.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<Review>,
    private bookService: BookService
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: string): Promise<Review> {
    // userId는 @Req()로 받아와서 유효성 검사 스킵
    // 책 유효성 검사
    this.bookService.validateBookId(createReviewDto.bookId);
    await this.bookService.validateBookExist(createReviewDto.bookId);

    const { content, bookId } = createReviewDto;
    const review = {
      content,
      book: bookId,
      user: userId,
    };
    const savedReview = await this.reviewModel.create(review);
    this.logger.log(`User[${userId}]가 Book[${bookId}]에 Review[${savedReview._id}] 작성`);
    return savedReview;
  }

  async findAll(query: Query): Promise<Review[]> {
    const resPerPage = 10;
    const curPage = Number(query.page) || 1;
    const skip = (curPage - 1) * resPerPage;

    const keyword = query.keyword
      ? {
          content: {
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
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    return review;
  }

  async updateById(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('리뷰 ID가 유효하지 않습니다.');
    }

    const updatedReview = await this.reviewModel.findByIdAndUpdate(id, updateReviewDto, {
      new: true,
      runValidators: true,
    });

    if (!updatedReview) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    return updatedReview;
  }

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('리뷰 ID가 유효하지 않습니다.');
    }

    const deletedReview = await this.reviewModel.findByIdAndDelete(id);
    if (!deletedReview) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    return { deleted: true };
  }
}
