import { IsEmpty, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class UpdateRatingRequestDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsEmpty()
  bookId: string;

  @IsEmpty()
  userId: string;
}
