import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { UpdateReviewDto } from './dtos/update-review.dto';

describe('ReviewController', () => {
  let reviewService: ReviewService;
  let reviewController: ReviewController;

  const req = { user: { _id: '66d4a3ac7acc954a2259528e' } };

  const createReviewDto = {
    content: 'Review Content',
    bookId: '60f3a8b4f6b9f2f8c5e7a2f3',
    userId: req.user._id,
  };

  const mockReview = {
    _id: '60f3a8b4f6b9f2f8c5e7a2f4',
    createReviewDto,
  };

  const mockReviewService = {
    create: jest.fn().mockResolvedValue(mockReview),
    findAll: jest.fn().mockResolvedValue([mockReview]),
    findById: jest.fn().mockResolvedValue(mockReview),
    updateById: jest.fn().mockResolvedValue(mockReview),
    deleteById: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ReviewController],
      providers: [
        ReviewService,
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
    reviewController = module.get<ReviewController>(ReviewController);
  });

  it('should be defined', () => {
    expect(reviewController).toBeDefined();
  });

  describe('createReview', () => {
    it('리뷰 생성 후 반환', async () => {
      const result = await reviewController.createReview(createReviewDto, req);

      expect(reviewService.create).toHaveBeenCalled();
      expect(result).toEqual(mockReview);
    });
  });

  describe('getAllReviews', () => {
    it('모든 리뷰 반환', async () => {
      const result = await reviewController.getAllReviews({ page: '1' });

      expect(reviewService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockReview]);
    });
  });

  describe('getReviewById', () => {
    it('ID로 리뷰 조회', async () => {
      const result = await reviewController.getReviewById(mockReview._id);

      expect(reviewService.findById).toHaveBeenCalled();
      expect(result).toEqual(mockReview);
    });
  });

  describe('updateReview', () => {
    it('리뷰 수정 후 반환', async () => {
      const updateReviewDto: UpdateReviewDto = { content: 'Updated Content' };
      const result = await reviewController.updateReview(mockReview._id, updateReviewDto, req);

      expect(reviewService.updateById).toHaveBeenCalled();
      expect(result).toEqual(mockReview);
    });
  });

  describe('deleteReview', () => {
    it('리뷰 삭제 후 반환', async () => {
      const result = await reviewController.deleteReview(mockReview._id, req);

      expect(reviewService.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });
});
