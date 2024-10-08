import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { ReviewResponseDto } from './dtos/review.response.dto';
import { ReviewsResponseDto } from './dtos/reviews.response.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createReview(@Body() reviewData: CreateReviewDto, @Req() req): Promise<ReviewResponseDto> {
    reviewData = { userId: req.user._id, ...reviewData };
    return this.reviewService.create(reviewData);
  }

  // 특정 책의 리뷰 목록
  @Get('book/:id')
  async getReviewsByBookId(@Param('id') bookId: string, @Query() query: ExpressQuery): Promise<ReviewsResponseDto> {
    return this.reviewService.findReviewsByBookId(bookId, query);
  }

  // 특정 사용자가 작성한 리뷰 목록
  @Get('user/:id')
  async getReviewsByUserId(@Param('id') userId: string, @Query() query: ExpressQuery): Promise<ReviewsResponseDto> {
    return this.reviewService.findReviewsByUserId(userId, query);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async updateReview(
    @Param('id') bookId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req
  ): Promise<ReviewResponseDto> {
    updateReviewDto = { userId: req.user._id, bookId: bookId, ...updateReviewDto };
    return this.reviewService.updateById(updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteReview(@Param('id') bookId: string, @Req() req): Promise<{ deleted: boolean }> {
    return this.reviewService.deleteById(bookId, req.user);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard())
  async likeReview(@Param('id') reviewId: string, @Req() req): Promise<void> {
    this.reviewService.toggleLikeReview(reviewId, req.user);
    return;
  }

  @Post(':id/dislike')
  @UseGuards(AuthGuard())
  async dislikeReview(@Param('id') reviewId: string, @Req() req): Promise<void> {
    this.reviewService.toggleDislikeReview(reviewId, req.user);
    return;
  }
}
