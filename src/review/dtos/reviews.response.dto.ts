import { ReviewResponseDto } from './review.response.dto';

export class ReviewsResponseDto {
  bookId: string;
  reviews: ReviewResponseDto[];
}
