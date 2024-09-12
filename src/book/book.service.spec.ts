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
    _id: new mongoose.Types.ObjectId('60f3a8b4f6b9f2f8c5e7a2f3'),
    title: 'Book Title',
    subtitle: 'Book Subtitle',
    author: 'Book Author',
    category: Category.FANTASY,
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
    model = module.get<Model<Book>>(getModelToken(Book.name));
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

  describe('findById', () => {
    it('should find and return a book by id', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockBook);

      const result = await bookService.findById(mockBookId);

      expect(model.findById).toHaveBeenCalledWith(mockBookId);
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

      await expect(bookService.findById(mockBookId)).rejects.toThrow(NotFoundException);
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

  describe('updateById', () => {
    it('should update and return a book', async () => {
      const updatedBook = { ...mockBook, title: 'Updated Title' };

      jest.spyOn(model, 'findById').mockResolvedValue(mockBook);
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(updatedBook);

      const result = await bookService.updateById(mockBookId, updatedBook as Book);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockBookId, updatedBook, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(updatedBook);
    });

    it('should throw BadRequestError if invalid ID is provided', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(bookService.updateById(id, mockBook)).rejects.toThrow(BadRequestException);
      expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });

    it('should throw NotFoundException if book is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(bookService.updateById(mockBookId, mockBook)).rejects.toThrow(NotFoundException);
    });

    describe('deleteById', () => {
      it('should delete a book', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(mockBook);
        jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockBook);

        const result = await bookService.deleteById(mockBookId);

        expect(model.findById).toHaveBeenCalledWith(mockBookId);
        expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockBookId);
        expect(result).toEqual({ deleted: true });
      });

      it('should throw BadRequestError if invalid ID is provided', async () => {
        const id = 'invalid-id';

        const isValidObjectIdMock = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

        await expect(bookService.deleteById(id)).rejects.toThrow(BadRequestException);
        expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
        isValidObjectIdMock.mockRestore();
      });

      it('should throw NotFoundException if book is not found', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(null);

        await expect(bookService.deleteById(mockBookId)).rejects.toThrow(NotFoundException);
      });
    });
  });
});
