import { IsEmpty, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class UpdateReviewDto {
  @IsNotEmpty()
  @IsNumber()
  @Length(0.5, 5)
  readonly rating: number;

  @IsString()
  @Length(0, 1000)
  readonly content?: string;

  @IsEmpty()
  readonly bookId: string;

  @IsEmpty()
  readonly userId: string;
}
