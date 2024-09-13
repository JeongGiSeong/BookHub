import { IsEmpty, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class UpdateRatingRequestDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  readonly rating: number;

  @IsEmpty()
  readonly bookId: string;

  @IsEmpty()
  readonly userId: string;
}
