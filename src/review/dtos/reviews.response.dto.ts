import { ReviewResponseDto } from './review.response.dto';

export class ReviewsResponseDto {
  book: {
    id: string;
    title: string;
    category: string;
    author: string;
    coverImage: string;
    avgRating: number;
    reviewCount: number;
  };
  reviews: ReviewResponseDto[];

  constructor(book, reviews) {
    this.book = {
      id: book._id.toString(),
      title: book.title,
      category: book.category,
      author: book.author,
      coverImage: book.coverImage,
      avgRating: book.avgRating,
      reviewCount: book.reviews.length,
    };
    this.reviews = reviews.map((review) => new ReviewResponseDto(review.user, review));
  }
}
