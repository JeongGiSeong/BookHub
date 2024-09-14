import { IsEmpty, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsNumber()
  @Length(0.5, 5)
  readonly rating: number;

  @IsString()
  @Length(1, 500)
  readonly content?: string;

  @IsNotEmpty()
  @IsString()
  readonly bookId: string;

  @IsEmpty()
  readonly userId: string;
}
