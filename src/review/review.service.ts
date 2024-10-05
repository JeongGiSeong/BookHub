import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { BookService } from 'src/book/book.service';
import { User } from 'src/auth/schemas/user.schema';
import { Role } from 'src/auth/enums/role.enum';
import { Book } from 'src/book/schemas/book.schema';
import { ReviewResponseDto } from './dtos/review.response.dto';
import { ReviewsResponseDto } from './dtos/reviews.response.dto';

import { Query } from 'express-serve-static-core';
import { Review } from './schemas/review.schema';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<Review>,
    private bookService: BookService,
    private authService: AuthService
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
    const { rating, bookId, userId } = createReviewDto;
    const book = await this.bookService.findAndValidateBook(bookId);
    const user = await this.authService.findAndValidateUser(userId);

    // 사용자 ID로 리뷰가 이미 존재하는지 확인
    this.checkExistingReview(book, userId);

    // 책 평점 업데이트
    await this.updateBookRating(book, rating);

    // 리뷰 생성
    const review = new this.reviewModel({
      ...createReviewDto,
      user: user._id,
      book: book._id,
    });
    await review.save();

    return new ReviewResponseDto(user, review);
  }

  private async updateBookRating(book: Book, rating: number) {
    const totalRating = book.reviews.reduce((acc, cur) => acc + cur.rating, 0);
    const avgRating = (totalRating + rating) / (book.reviews.length + 1);
    book.avgRating = avgRating;
    await book.save();
  }

  private checkExistingReview(book: Book, userId: string) {
    const existingReview = book.reviews.find((r) => r.userId.toString() === userId);
    if (existingReview) {
      throw new BadRequestException('이미 리뷰를 작성했습니다.');
    }
  }

  async findReviewsByBookId(bookId: string, query: Query): Promise<ReviewsResponseDto> {
    const resPerPage = Number(query.limit) || 10;
    const curPage = Number(query.page) || 1;
    const skip = (curPage - 1) * resPerPage;
    const sort = String(query.sort) || 'createdAt';
    const order = String(query.order) === 'asc' ? 1 : -1;

    const book = await this.bookService.findAndValidateBook(bookId);
    const reviews = await this.reviewModel
      .find({ bookId: book._id })
      .populate('userId')
      .sort({ [sort]: order })
      .skip(skip)
      .limit(resPerPage);

    // 사용자 정보를 포함하여 ReviewsResponseDto 생성
    const reviewsResponse = await Promise.all(
      reviews.map(async (review) => {
        const user = await this.authService.findAndValidateUser(review.userId.toString());
        return new ReviewResponseDto(user, review);
      })
    );

    return new ReviewsResponseDto(book, reviewsResponse);
  }

  // 사용자가 리뷰를 단 책 목록
  async findReviewsByUserId(userId: string, query: Query): Promise<ReviewsResponseDto> {
    const resPerPage = Number(query.limit) || 10;
    const curPage = Number(query.page) || 1;
    const skip = (curPage - 1) * resPerPage;
    const sort = String(query.sort) || 'createdAt';
    const order = String(query.order) === 'asc' ? 1 : -1;

    const user = await this.authService.findAndValidateUser(userId);
    const reviews = await this.reviewModel
      .find({ userId: user._id })
      .populate('bookId')
      .sort({ [sort]: order })
      .skip(skip)
      .limit(resPerPage);

    const reviewsResponse = reviews.map((review) => {
      return new ReviewResponseDto(user, review);
    });

    return new ReviewsResponseDto(user, reviewsResponse);
  }

  async updateById(updateReviewDto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const { rating, content, bookId, userId } = updateReviewDto;
    await this.bookService.findAndValidateBook(bookId);
    const user = await this.authService.findAndValidateUser(userId);

    // 작성자만 수정 가능
    const review = await this.reviewModel.findOne({ bookId, userId });
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    review.rating = rating;
    review.content = content;
    await review.save();

    return new ReviewResponseDto(user, review);
  }

  async deleteById(reviewId: string, user: User): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw new BadRequestException('잘못된 ID입니다.');
    }

    // 본인 또는 관리자만 삭제 가능
    const review = await this.reviewModel.findById(reviewId);

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.userId.toString() !== user._id && !user.role.includes(Role.ADMIN)) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    await review.deleteOne();

    // 리뷰 삭제 후 책 평점 업데이트
    const book = await this.bookService.findAndValidateBook(review.bookId.toString());
    await this.updateBookRating(book, -review.rating);

    return { deleted: true };
  }

  async toggleLikeReview(reviewId: string, user: User): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    const userId = new mongoose.Types.ObjectId(user._id.toString());

    // 이미 좋아요를 눌렀는지 확인
    const likeIndex = review.likes.indexOf(userId);
    if (likeIndex > -1) {
      review.likes.splice(likeIndex, 1);
    } else {
      review.likes.push(userId);
    }
    await review.save();
  }

  async toggleDislikeReview(reviewId: string, user: User): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    const userId = new mongoose.Types.ObjectId(user._id.toString());

    // 이미 싫어요를 눌렀는지 확인
    const dislikeIndex = review.dislikes.indexOf(userId);
    if (dislikeIndex > -1) {
      review.dislikes.splice(dislikeIndex, 1);
    } else {
      review.dislikes.push(userId);
    }
    await review.save();
  }
}
