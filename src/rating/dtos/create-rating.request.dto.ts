import { IsEmpty, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateRatingRequestDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  bookId: string;

  @IsEmpty()
  userId: string;
}
