import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRatingRequestDto } from './dtos/create-rating.request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookService } from 'src/book/book.service';
import { Role } from 'src/auth/enums/role.enum';
import { Book } from 'src/book/schemas/book.schema';
import { RatingReponseDto } from './dtos/rating.response.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RatingService {
  private readonly logger = new Logger(RatingService.name);

  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<Book>,
    private bookService: BookService,
    private authService: AuthService
  ) {}

  async create(ratingData: CreateRatingRequestDto): Promise<RatingReponseDto> {
    const { rating, userId, bookId } = ratingData;

    const book = await this.bookService.findAndValidateBook(bookId);

    // 사용자 ID로 평점이 이미 존재하는지 확인
    const existingRating = book.ratings.find((r) => r.userId === userId);
    if (existingRating) {
      throw new ConflictException('이미 평점을 등록했습니다.');
    }

    book.ratings.push({
      rating: ratingData.rating,
      userId: userId,
    });
    await book.save();

    this.logger.log(`User[${userId}]가 Book[${bookId}]에 Rating 생성`);

    return {
      rating: rating,
      userId: userId,
      bookId: bookId,
    };
  }

  async getAverageRatingByUserId(userId: string): Promise<number> {
    const books = await this.bookModel.find({ 'ratings.user': userId }).exec();
    if (books.length === 0) {
      return 0; // 평점이 없는 경우 0 반환
    }
    const total = books.reduce((sum, book) => {
      const userRating = book.ratings.find((r) => r.userId === userId);
      return sum + userRating.rating;
    }, 0);
    const average = total / books.length;

    // 소수점 1자리로 반올림
    return parseFloat(average.toFixed(1));
  }

  async getAverageRatingByBookId(bookId: string): Promise<number> {
    const book = await this.bookService.findAndValidateBook(bookId);

    if (book.ratings.length === 0) {
      return 0; // 평점이 없는 경우 0 반환
    }
    const total = book.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const average = total / book.ratings.length;

    // 소수점 1자리로 반올림
    return parseFloat(average.toFixed(1));
  }

  async updateById(newRatingData: CreateRatingRequestDto): Promise<RatingReponseDto> {
    const { rating, userId, bookId } = newRatingData;

    const user = await this.authService.findAndValidateUser(userId);

    // 본인 또는 관리자만 수정 가능
    if (user._id.toString() !== userId && !user.role.includes(Role.Admin)) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const book = await this.bookService.findAndValidateBook(bookId);

    const ratingIndex = book.ratings.findIndex((r) => r.userId === userId);
    if (ratingIndex === -1) {
      throw new NotFoundException('평점을 찾을 수 없습니다.');
    }

    book.ratings[ratingIndex].rating = rating;
    await book.save();

    this.logger.log(`User[${userId}]가 Book[${bookId}]의 Rating을 ${rating}으로 수정`);

    return {
      rating: rating,
      userId: userId,
      bookId: bookId,
    };
  }

  async deleteById(bookId: string, userId: string): Promise<{ deleted: boolean }> {
    const user = await this.authService.findAndValidateUser(userId);

    // 본인 또는 관리자만 삭제 가능
    if (user._id.toString() !== userId && !user.role.includes(Role.Admin)) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const book = await this.bookService.findById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const ratingIndex = book.ratings.findIndex((r) => r.userId === userId);
    if (ratingIndex === -1) {
      throw new NotFoundException('평점을 찾을 수 없습니다.');
    }

    book.ratings.splice(ratingIndex, 1);
    await book.save();

    this.logger.log(`User[${userId}]가 Book[${bookId}]의 Rating을 삭제`);

    return { deleted: true };
  }
}
