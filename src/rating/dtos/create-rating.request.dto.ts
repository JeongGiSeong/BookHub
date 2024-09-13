import { IsEmpty, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateRatingRequestDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  readonly rating: number;

  @IsNotEmpty()
  @IsString()
  readonly bookId: string;

  @IsEmpty()
  readonly userId: string;
}
