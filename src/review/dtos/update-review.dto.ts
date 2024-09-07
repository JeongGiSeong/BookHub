import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReviewDto {
  @IsNotEmpty()
  @IsString()
  readonly content: string;
}
