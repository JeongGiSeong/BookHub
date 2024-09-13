import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateRatingRequestDto } from './dtos/create-rating.request.dto';
import { RatingReponseDto } from './dtos/rating.response.dto';
import { UpdateRatingRequestDto } from './dtos/update-rating.request.dto';

@Controller('ratings')
export class RatingController {
  constructor(private ratingService: RatingService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createRating(@Body() ratingData: CreateRatingRequestDto, @Req() req): Promise<RatingReponseDto> {
    ratingData = { userId: req.user._id, ...ratingData };
    return this.ratingService.create(ratingData);
  }

  // 특정 책의 평점 평균
  @Get('average/book/:id')
  async getAverageRatingByBookId(@Param('id') bookId: string): Promise<number> {
    return this.ratingService.getAverageRatingByBookId(bookId);
  }

  // 특정 사용자의 평점 평균
  @Get('average/user/:id')
  async getAverageRatingByUserId(@Param('id') userId: string): Promise<number> {
    return this.ratingService.getAverageRatingByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async updateRating(
    @Param('id') bookId: string,
    @Body() updateRatingData: UpdateRatingRequestDto,
    @Req() req
  ): Promise<RatingReponseDto> {
    updateRatingData = { userId: req.user._id, bookId, ...updateRatingData };
    return this.ratingService.updateById(updateRatingData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteRating(@Param('id') bookId: string, @Req() req): Promise<{ deleted: boolean }> {
    return this.ratingService.deleteById(bookId, req.user._id);
  }
}
