import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateReviewDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  readonly content: string;
}
