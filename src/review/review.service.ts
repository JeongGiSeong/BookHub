import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './shema/review.schema';
import mongoose, { Model } from 'mongoose';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';

import { Query } from 'express-serve-static-core';
import { BookService } from 'src/book/book.service';
import { User } from 'src/auth/schemas/user.schema';
import { Role } from 'src/auth/enums/role.enum';

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
    this.validateReviewId(id);

    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    return review;
  }

  async updateById(reviewId: string, updateReviewDto: UpdateReviewDto, user: User): Promise<Review> {
    this.validateReviewId(reviewId);

    // 작성자, 관리자만 수정 가능
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.user.toString() !== user._id.toString() && !user.role.includes(Role.Admin)) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const updatedReview = await this.reviewModel.findByIdAndUpdate(reviewId, updateReviewDto, {
      new: true,
      runValidators: true,
    });

    return updatedReview;
  }

  async deleteById(reviewId: string, user: User): Promise<{ deleted: boolean }> {
    this.validateReviewId(reviewId);

    // 작성자, 관리자만 수정 가능
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.user.toString() !== user._id.toString() && !user.role.includes(Role.Admin)) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const deletedReview = await this.reviewModel.findByIdAndDelete(reviewId);
    if (!deletedReview) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    return { deleted: true };
  }

  public validateReviewId(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('리뷰 ID가 유효하지 않습니다.');
    }
  }
}
