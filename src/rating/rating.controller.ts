import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { AuthGuard } from '@nestjs/passport';
import { Rating } from './schemas/rating.schema';
import { CreateRatingDto } from './dtos/create-rating.dto';

@Controller('ratings')
export class RatingController {
  constructor(private ratingService: RatingService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createRating(@Body() createRatingDto: CreateRatingDto, @Req() req): Promise<Rating> {
    createRatingDto = { ...createRatingDto, userId: req.user._id };
    return this.ratingService.create(createRatingDto);
  }

  // 특정 책의 평점 평균
  @Get('average/:bookId')
  async getAverageRatingByBookId(@Param('bookId') bookId: string): Promise<number> {
    return this.ratingService.getAverageRatingByBookId(bookId);
  }

  // 특정 사용자의 평점 평균
  @Get('average/user/:userId')
  async getAverageRatingByUserId(@Param('userId') userId: string): Promise<number> {
    return this.ratingService.getAverageRatingByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async updateRating(
    @Param('id') ratingId: string,
    @Body() updateRatingDto: CreateRatingDto,
    @Req() req
  ): Promise<Rating> {
    return this.ratingService.updateById(ratingId, updateRatingDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteRating(@Param('id') ratingId: string, @Req() req): Promise<{ deleted: boolean }> {
    return this.ratingService.deleteById(ratingId, req.user);
  }
}
