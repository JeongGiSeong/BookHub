import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

describe('BookService', () => {
  let bookService: BookService;
  let bookModel: Model<Book>;

  const mockBook = {
    _id: new mongoose.Types.ObjectId('60f3a8b4f6b9f2f8c5e7a2f3'),
    title: 'Book Title',
    subtitle: 'Book Subtitle',
    author: 'Book Author',
    category: 'Category',
    coverImage: 'https://about.google/assets-main/img/glue-google-color-logo.svg',
    yes24url: 'https://www.yes24.com/Product/Goods/77283734',
    publisher: 'Book Publisher',
    publishedAt: '2021-07-19',
  } as Book;
  const mockBookId = mockBook._id.toString();

  const mockBookService = {
    findById: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    bookModel = module.get<Model<Book>>(getModelToken(Book.name));
  });

  describe('create', () => {
    it('성공 - 책 생성 후 반환', async () => {
      jest.spyOn(bookService, 'scrapeBook').mockResolvedValue(mockBook);
      jest.spyOn(bookModel, 'create').mockResolvedValue(mockBook as any);

      const result = await bookService.create(mockBook.yes24url);

      expect(bookService.scrapeBook).toHaveBeenCalledWith(mockBook.yes24url);
      expect(bookModel.create).toHaveBeenCalledWith(mockBook);
      expect(result).toEqual(mockBook);
    });

    it('실패 - scrapeBook 오류', async () => {
      jest
        .spyOn(bookService, 'scrapeBook')
        .mockRejectedValue(new HttpException('책을 불러오는데 실패했습니다.', HttpStatus.INTERNAL_SERVER_ERROR));

      const url = mockBook.yes24url;

      await expect(bookService.create(url)).rejects.toThrow(HttpException);
      await expect(bookService.create(url)).rejects.toThrow('책을 불러오는데 실패했습니다.');
    });
  });

  describe('findAll', () => {
    it('성공 - 모든 책 조회 후 반환', async () => {
      const query = { keyword: 'Book', page: '1' };

      jest.spyOn(bookModel, 'find').mockImplementation(
        () =>
          ({
            limit: () => ({
              skip: jest.fn().mockResolvedValue([mockBook]),
            }),
          }) as any
      );

      const result = await bookService.findAll(query);

      expect(bookModel.find).toHaveBeenCalledWith({
        title: { $regex: query.keyword, $options: 'i' },
      });
      expect(result).toEqual([mockBook]);
    });
  });

  describe('findById', () => {
    it('성공 - 책 조회 후 반환', async () => {
      jest.spyOn(bookService, 'findAndValidateBook').mockResolvedValue(mockBook);

      const result = await bookService.findById(mockBookId);

      expect(bookService.findAndValidateBook).toHaveBeenCalledWith(mockBookId);
      expect(result).toEqual(mockBook);
    });

    it('실패 - Invalid ID', async () => {
      const id = 'invalid-id';

      jest.spyOn(bookService, 'findAndValidateBook').mockImplementation(() => {
        throw new BadRequestException('유효하지 않은 책 ID입니다.');
      });

      await expect(bookService.findById(id)).rejects.toThrow(BadRequestException);
    });

    it('실패 - 책 조회 실패 시 NotFoundException', async () => {
      jest.spyOn(bookService, 'findAndValidateBook').mockImplementation(() => {
        throw new NotFoundException('책을 찾을 수 없습니다.');
      });

      await expect(bookService.findById(mockBookId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateById', () => {
    it('성공 - 책 정보 업데이트 후 반환', async () => {
      const url = 'new-url';
      const newBook = { ...mockBook, yes24url: url } as Book;

      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      jest.spyOn(bookService, 'scrapeBook').mockResolvedValue(newBook);
      jest.spyOn(bookModel, 'findByIdAndUpdate').mockResolvedValue(newBook);

      const result = await bookService.updateById(mockBookId, url);

      expect(bookService.scrapeBook).toHaveBeenCalledWith(url);
      expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(mockBookId, newBook, { new: true });
      expect(result).toEqual(newBook);
    });

    it('실패 - ID가 유효하지 않을 시 BadRequestException', async () => {
      const id = 'invalid-id';

      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

      await expect(bookService.updateById(id, mockBook.yes24url)).rejects.toThrow(BadRequestException);
    });

    it('실패 - 책을 찾을 수 없을 시 NotFoundException', async () => {
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      jest.spyOn(bookService, 'scrapeBook').mockResolvedValue(mockBook);
      jest.spyOn(bookModel, 'findByIdAndUpdate').mockResolvedValue(null);

      await expect(bookService.updateById(mockBookId, mockBook.yes24url)).rejects.toThrow(NotFoundException);
    });

    describe('deleteById', () => {
      it('성공 - 책 삭제', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        jest.spyOn(bookModel, 'findByIdAndDelete').mockResolvedValue(mockBook);

        const result = await bookService.deleteById(mockBookId);

        expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(mockBookId);
        expect(bookModel.findByIdAndDelete).toHaveBeenCalledWith(mockBookId);
        expect(result).toEqual({ deleted: true });
      });

      it('실패 - ID가 유효하지 않을 시 BadRequestException', async () => {
        const invalidId = 'invalid-id';
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

        await expect(bookService.deleteById(invalidId)).rejects.toThrow(BadRequestException);
        expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(invalidId);
      });

      it('실패 - 책 조회 실패 시 NotFoundException', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        jest.spyOn(bookModel, 'findByIdAndDelete').mockResolvedValue(null);

        await expect(bookService.deleteById(mockBookId)).rejects.toThrow(NotFoundException);
        expect(bookModel.findByIdAndDelete).toHaveBeenCalledWith(mockBookId);
      });
    });

    describe('findAndValidateBook', () => {
      it('성공 - 책 조회 후 반환', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        jest.spyOn(bookModel, 'findById').mockResolvedValue(mockBook);

        const result = await bookService.findAndValidateBook(mockBookId);

        expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(mockBookId);
        expect(bookModel.findById).toHaveBeenCalledWith(mockBookId);
        expect(result).toEqual(mockBook);
      });

      it('실패 - ID가 유효하지 않을 시 BadRequestException', async () => {
        const invalidId = 'invalid-id';
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

        await expect(bookService.findAndValidateBook(invalidId)).rejects.toThrow(BadRequestException);
        expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(invalidId);
      });

      it('실패 - 책 조회 실패 시 NotFoundException', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        jest.spyOn(bookModel, 'findById').mockResolvedValue(null);

        await expect(bookService.findAndValidateBook(mockBookId)).rejects.toThrow(NotFoundException);
        expect(bookModel.findById).toHaveBeenCalledWith(mockBookId);
      });
    });
  });
});
