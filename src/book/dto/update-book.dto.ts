import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Category } from '../schemas/book.schema';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly subtitle: string;

  @IsOptional()
  @IsString()
  readonly summary: string;

  @IsOptional()
  @IsString()
  readonly author: string;

  @IsOptional()
  @IsEnum(Category, { message: 'Invalid category' })
  readonly category: Category;

  @IsOptional()
  @IsString()
  readonly coverImage: string;

  @IsOptional()
  @IsString()
  readonly yes24Link: string;
}
