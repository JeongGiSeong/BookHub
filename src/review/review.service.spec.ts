import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ReviewService } from './review.service';
import { Review } from './shema/review.schema';
import { CreateReviewDto } from './dtos/create-review.dto';
import { BookService } from 'src/book/book.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let bookService: BookService;
  let model: Model<Review>;

  const createReviewDto: CreateReviewDto = {
    content: 'Review Content',
    bookId: '60f3a8b4f6b9f2f8c5e7a2f3',
  };
  const userId = '66d4a3ac7acc954a2259528e';

  const mockReview = {
    _id: '60f3a8b4f6b9f2f8c5e7a2f4',
    createReviewDto,
    user: userId,
  };

  const mockReviewService = {
    findById: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockBookService = {
    validateBookId: jest.fn(),
    validateBookExist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        BookService,
        {
          provide: getModelToken(Review.name),
          useValue: mockReviewService,
        },
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
    bookService = module.get<BookService>(BookService);
    model = module.get<Model<Review>>(getModelToken(Review.name));
  });

  describe('create', () => {
    it('리뷰 생성 후 반환', async () => {
      jest.spyOn(bookService, 'validateBookId').mockImplementation(() => {});
      jest.spyOn(bookService, 'validateBookExist').mockImplementation(async () => {});
      jest.spyOn(model, 'create').mockResolvedValue(mockReview as any);

      const result = await reviewService.create(createReviewDto, userId);

      expect(bookService.validateBookId).toHaveBeenCalledWith(createReviewDto.bookId);
      expect(bookService.validateBookExist).toHaveBeenCalledWith(createReviewDto.bookId);
      expect(model.create).toHaveBeenCalledWith({
        content: createReviewDto.content,
        book: createReviewDto.bookId,
        user: userId,
      });
      expect(result).toEqual(mockReview);
    });

    it('책 ID가 유효하지 않으면 BadRequestException 발생', async () => {
      const mock = jest.spyOn(bookService, 'validateBookId').mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(reviewService.create(createReviewDto, userId)).rejects.toThrow(BadRequestException);
      expect(mock).toHaveBeenCalledWith(createReviewDto.bookId);
    });

    it('책이 존재하지 않으면 NotFoundException 발생', async () => {
      jest.spyOn(bookService, 'validateBookId').mockImplementation(() => {});
      jest.spyOn(bookService, 'validateBookExist').mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(reviewService.create(createReviewDto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('모든 리뷰 반환', async () => {
      const query = { page: '1', keyword: 'keyword' };

      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue([mockReview]),
        }),
      } as any);

      const result = await reviewService.findAll(query);

      expect(model.find).toHaveBeenCalledWith({ content: { $regex: query.keyword, $options: 'i' } });
      expect(result).toEqual([mockReview]);
    });
  });

  describe('findById', () => {
    it('리뷰 ID로 조회 후 반환', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockReview as any);

      const result = await reviewService.findById(mockReview._id);

      expect(model.findById).toHaveBeenCalledWith(mockReview._id);
      expect(result).toEqual(mockReview);
    });

    it('유효하지 않은 ID가 제공되면 BadRequestException 발생', async () => {
      const id = 'invalid-id';
      const isValidObjectIdMock = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(reviewService.findById(id)).rejects.toThrow(BadRequestException);
      expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('updateById', () => {
    it('리뷰 ID로 수정 후 반환', async () => {
      const newReviewUpdateDto = { content: 'New Content' };
      const newReview = { ...mockReview, content: newReviewUpdateDto };
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(newReview as any);

      const result = await reviewService.updateById(mockReview._id, newReviewUpdateDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockReview._id, newReviewUpdateDto, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(newReview);
    });

    it('유효하지 않은 ID가 제공되면 BadRequestException 발생', async () => {
      const id = 'invalid-id';
      const isValidObjectIdMock = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(reviewService.updateById(id, createReviewDto)).rejects.toThrow(BadRequestException);
      expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('deleteById', () => {
    it('리뷰 ID로 삭제 후 반환', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockReview as any);

      const result = await reviewService.deleteById(mockReview._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockReview._id);
      expect(result).toEqual({ deleted: true });
    });

    it('유효하지 않은 ID가 제공되면 BadRequestException 발생', async () => {
      const id = 'invalid-id';
      const isValidObjectIdMock = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(reviewService.deleteById(id)).rejects.toThrow(BadRequestException);
      expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });
  });
});
