import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { Review } from './shema/review.schema';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createReview(
    @Body()
    createReviewDto: CreateReviewDto,
    @Req() req
  ): Promise<Review> {
    createReviewDto = { ...createReviewDto, userId: req.user._id };
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  async getAllReviews(@Query() query: ExpressQuery): Promise<Review[]> {
    return this.reviewService.findAll(query);
  }

  @Get(':id')
  async getReviewById(@Param('id') id: string): Promise<Review> {
    return this.reviewService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async updateReview(
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req
  ): Promise<Review> {
    return this.reviewService.updateById(reviewId, updateReviewDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteReview(@Param('id') reviewId: string, @Req() req): Promise<{ deleted: boolean }> {
    return this.reviewService.deleteById(reviewId, req.user);
  }
}
