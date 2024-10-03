import { User } from 'src/auth/schemas/user.schema';
import { Review } from '../schemas/review.schema';

export class ReviewResponseDto {
  user: {
    id: string;
    name: string;
    reviewCount: number;
    // profileImage: string;
  };
  reviewId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;

  constructor(user: User, review: Review) {
    this.user = {
      id: user._id.toString(),
      name: user.name,
      reviewCount: user.reviews.length,
    };
    this.reviewId = review._id.toString();
    this.rating = review.rating;
    this.content = review.content;
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
    this.likes = review.likes;
    this.dislikes = review.dislikes;
  }
}
