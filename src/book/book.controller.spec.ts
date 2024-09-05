import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { Category } from './schemas/book.schema';
import { BookController } from './book.controller';
import { ScraperService } from './scraper.service';
import { PassportModule } from '@nestjs/passport';

describe('BookController', () => {
  let bookService: BookService;
  let scraperService: ScraperService;
  let bookController: BookController;

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

  const url = 'https://www.yes24.com/Product/Goods/77283734';

  const mockBookService = {
    findAll: jest.fn().mockResolvedValue([mockBook]),
    create: jest.fn().mockResolvedValue(mockBook),
    findById: jest.fn().mockResolvedValue(mockBook),
    updateById: jest.fn().mockResolvedValue(mockBook),
    deleteById: jest.fn().mockResolvedValue({ deleted: true }),
  };
  const mockScraperService = {
    scrapeBook: jest.fn().mockResolvedValue(mockBook),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookController],
      providers: [
        BookService,
        ScraperService,
        {
          provide: BookService,
          useValue: mockBookService,
        },
        {
          provide: ScraperService,
          useValue: mockScraperService,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    scraperService = module.get<ScraperService>(ScraperService);
    bookController = module.get<BookController>(BookController);
  });

  it('should be defined', () => {
    expect(bookController).toBeDefined();
  });

  describe('getBookById', () => {
    it('ID로 책 조회', async () => {
      const result = await bookController.getBookById(mockBook._id);

      expect(bookService.findById).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });
  });

  describe('getAllBooks', () => {
    it('모든 책 return', async () => {
      const result = await bookController.getAllBooks({
        page: '1',
        keyword: 'test',
      });

      expect(bookService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockBook]);
    });
  });

  describe('createBook', () => {
    it('새 책 생성', async () => {
      const result = await bookController.createBook({ url });

      expect(scraperService.scrapeBook).toHaveBeenCalled();
      expect(bookService.create).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });
  });

  describe('updateBook', () => {
    it('ID로 책 업데이트', async () => {
      const result = await bookController.updateBook(mockBook._id, { url });

      expect(scraperService.scrapeBook).toHaveBeenCalled();
      expect(bookService.updateById).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });
  });

  describe('deleteBook', () => {
    it('ID로 책 삭제', async () => {
      const result = await bookController.deleteBook(mockBook._id);

      expect(bookService.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });
});
