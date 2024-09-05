import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book, Category } from './schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookService', () => {
  let bookService: BookService;
  let model: Model<Book>;

  const mockBook = {
    _id: '60f3a8b4f6b9f2f8c5e7a2f3',
    title: 'Book Title',
    subtitle: 'Book Subtitle',
    author: 'Book Author',
    category: Category.FANTASY,
    coverImage: 'https://about.google/assets-main/img/glue-google-color-logo.svg',
    yes24url: 'https://www.yes24.com/Product/Goods/77283734',
    publisher: 'Book Publisher',
    publishedAt: '2021-07-19',
  };

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
    model = module.get<Model<Book>>(getModelToken(Book.name));
  });

  describe('findById', () => {
    it('should find and return a book by id', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockBook);

      const result = await bookService.findById(mockBook._id);

      expect(model.findById).toHaveBeenCalledWith(mockBook._id);
      expect(result).toEqual(mockBook);
    });

    it('should throw BadRequestError if invalid ID is provided', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(bookService.findById(id)).rejects.toThrow(BadRequestException);
      expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });

    it('should throw NotFoundException if book is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(bookService.findById(mockBook._id)).rejects.toThrow(NotFoundException);

      expect(model.findById).toHaveBeenCalledWith(mockBook._id);
    });
  });

  describe('findAll', () => {
    it('should find and return all books', async () => {
      const query = { keyword: 'Book', page: '1' };

      jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            limit: () => ({
              skip: jest.fn().mockResolvedValue([mockBook]),
            }),
          }) as any
      );

      const result = await bookService.findAll(query);

      expect(model.find).toHaveBeenCalledWith({
        title: { $regex: query.keyword, $options: 'i' },
      });
      expect(result).toEqual([mockBook]);
    });
  });

  describe('create', () => {
    it('should create and return a book', async () => {
      // create는 배열 또는 단일 객체를 반환할 수 있으므로 any로 타입을 지정
      jest.spyOn(model, 'create').mockResolvedValue(mockBook as any);

      const result = await bookService.create(mockBook);

      expect(model.create).toHaveBeenCalledWith(mockBook);
      expect(result).toEqual(mockBook);
    });
  });

  describe('updateById', () => {
    it('should update and return a book', async () => {
      const updatedBook = { ...mockBook, title: 'Updated Title' };

      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(updatedBook);

      const result = await bookService.updateById(mockBook._id, updatedBook);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockBook._id, updatedBook, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(updatedBook);
    });
  });

  describe('deleteById', () => {
    it('should delete and return a book', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockBook);

      const result = await bookService.deleteById(mockBook._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockBook._id);
      expect(result).toEqual(mockBook);
    });
  });
});
