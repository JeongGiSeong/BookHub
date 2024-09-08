import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  readonly content: string;

  @IsNotEmpty()
  @IsString()
  readonly bookId: string;
}
