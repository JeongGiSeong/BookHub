import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { ReviewGuard } from './guards/review.guard';
import { Review } from './shema/review.schema';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createReview(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
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
  async updateReview(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto): Promise<Review> {
    return this.reviewService.updateById(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), ReviewGuard)
  async deleteReview(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.reviewService.deleteById(id);
  }
}
