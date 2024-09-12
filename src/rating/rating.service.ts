import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { Rating } from './schemas/rating.schema';
import { User } from 'src/auth/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookService } from 'src/book/book.service';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class RatingService {
  private readonly logger = new Logger(RatingService.name);

  constructor(
    @InjectModel(Rating.name)
    private ratingModel: Model<Rating>,
    private bookService: BookService
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    const { userId, bookId } = createRatingDto;
    // bookId 유효성 검사
    this.bookService.validateBookId(bookId);
    await this.bookService.validateBookExist(bookId);

    const savedRating = await this.ratingModel.create(createRatingDto);
    this.logger.log(`User[${userId}]가 Book[${bookId}]에 Rating[${savedRating._id}] 작성`);
    return savedRating;
  }

  async getAverageRatingByUserId(userId: string): Promise<number> {
    const ratings = await this.ratingModel.find({ user: userId }).exec();
    if (ratings.length === 0) {
      return 0; // 평점이 없는 경우 0 반환
    }
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const average = total / ratings.length;

    // 소수점 1자리로 반올림
    return parseFloat(average.toFixed(1));
  }

  async getAverageRatingByBookId(bookId: string): Promise<number> {
    const ratings = await this.ratingModel.find({ book: bookId }).exec();
    if (ratings.length === 0) {
      return 0; // 평점이 없는 경우 0 반환
    }
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const average = total / ratings.length;

    // 소수점 1자리로 반올림
    return parseFloat(average.toFixed(1));
  }

  async updateById(ratingId: string, updateRatingDto: CreateRatingDto, user: User): Promise<Rating> {
    const rating = await this.ratingModel.findById(ratingId).exec();
    if (!rating) {
      throw new NotFoundException('평점을 찾을 수 없습니다.');
    }
    if (rating.user.toString() !== user._id.toString() && !user.role.includes(Role.Admin)) {
      throw new ForbiddenException('권한이 없습니다.');
    }
    Object.assign(rating, updateRatingDto);
    return rating.save();
  }

  async deleteById(ratingId: string, user: User): Promise<{ deleted: boolean }> {
    const rating = await this.ratingModel.findById(ratingId).exec();
    if (!rating) {
      throw new NotFoundException('평점을 찾을 수 없습니다.');
    }
    if (rating.user.toString() !== user._id.toString() && !user.role.includes(Role.Admin)) {
      throw new ForbiddenException('권한이 없습니다.');
    }
    await this.ratingModel.deleteOne({ _id: ratingId }).exec();
    return { deleted: true };
  }
}
