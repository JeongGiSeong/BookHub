import { IsEmpty, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsNotEmpty()
  @IsString()
  bookId: string;

  @IsEmpty()
  userId: string;
}
