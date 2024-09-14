import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { BookService } from 'src/book/book.service';
import { User } from 'src/auth/schemas/user.schema';
import { Role } from 'src/auth/enums/role.enum';
import { Book } from 'src/book/schemas/book.schema';
import { AuthService } from 'src/auth/auth.service';
import { ReviewResponseDto } from './dtos/review.response.dto';
import { ReviewsResponseDto } from './dtos/reviews.response.dto';

import { Query } from 'express-serve-static-core';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: Model<Book>,
    private bookService: BookService,
    private authService: AuthService
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
    const { content, bookId, userId } = createReviewDto;
    const book = await this.bookService.findAndValidateBook(bookId);

    // 사용자 ID로 리뷰가 이미 존재하는지 확인
    const existingReview = book.reviews.find((r) => r.userId === userId);
    if (existingReview) {
      throw new ForbiddenException('이미 리뷰를 등록했습니다.');
    }

    const newReview = {
      content,
      userId: userId,
    };

    book.reviews.push(newReview);
    await book.save();

    this.logger.log(`User[${userId}]가 Book[${bookId}]에 Review 생성`);

    return {
      bookId: bookId,
      ...newReview,
    };
  }

  async findReviewsByBookId(bookId: string, query: Query): Promise<ReviewsResponseDto> {
    const resPerPage = Number(query.limit) || 10;
    const curPage = Number(query.page) || 1;
    const skip = (curPage - 1) * resPerPage;
    const sort = String(query.sort) || 'createdAt';
    const order = String(query.order) === 'asc' ? 1 : -1;

    const book = await this.bookModel.findById(bookId).select('reviews').exec();

    if (!book) {
      throw new NotFoundException('리뷰가 없습니다.');
    }

    // 리뷰 배열의 복사본을 만들어 정렬
    const sortedReviews = [...book.reviews].sort((a, b) => {
      if (a[sort] < b[sort]) return -order;
      if (a[sort] > b[sort]) return order;
      return 0;
    });
    const paginatedReviews = sortedReviews.slice(skip, skip + resPerPage);

    return { bookId, reviews: paginatedReviews };
  }

  // TODO: 사용자가 리뷰를 단 책 목록

  async updateById(bookId: string, updateReviewDto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const { content, userId } = updateReviewDto;
    const book = await this.bookService.findAndValidateBook(bookId);

    // 사용자 ID로 리뷰가 이미 존재하는지 확인
    const existingReview = book.reviews.find((r) => r.userId === userId);
    if (!existingReview) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    // 리뷰 내용 수정
    existingReview.content = content;
    existingReview.updatedAt = new Date();
    await book.save();

    return {
      bookId: bookId,
      ...existingReview,
    };
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
}
