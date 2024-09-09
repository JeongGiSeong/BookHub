import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { Role } from './../src/auth/enums/role.enum';

describe('ReviewController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let anotherJwtToken: string;
  let adminJwtToken: string;
  let createdBook;
  let createdReview;

  const user = {
    name: 'reviewcontroller',
    email: 'review@review.com',
    password: 'review',
    role: [Role.User],
  };

  const anotherUser = {
    name: 'anotherUesr',
    email: 'anotherUesr@anotherUesr.com',
    password: 'anotherUesr',
    role: [Role.User],
  };

  const admin = {
    name: 'admin',
    email: 'admin@admin.com',
    password: 'admin',
    role: [Role.User, Role.Admin],
  };

  const url = { url: 'https://www.yes24.com/Product/Goods/19040233' };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await app.close();
  });

  it('(POST) 일반유저 회원가입', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(201)
      .then((res) => {
        expect(res.body.token).toBeDefined();
        jwtToken = res.body.token;
      });
  });

  it('(POST) 다른 일반유저 회원가입', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(anotherUser)
      .expect(201)
      .then((res) => {
        expect(res.body.token).toBeDefined();
        anotherJwtToken = res.body.token;
      });
  });

  it('(POST) 관리자 회원가입', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(admin)
      .expect(201)
      .then((res) => {
        expect(res.body.token).toBeDefined();
        adminJwtToken = res.body.token;
      });
  });

  it('(POST) 새 책 등록', () => {
    return request(app.getHttpServer())
      .post('/books')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(url)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.title).toEqual('자바 ORM 표준 JPA 프로그래밍');
        createdBook = res.body;
      });
  });

  it('(POST) 리뷰 생성', () => {
    return request(app.getHttpServer())
      .post('/reviews')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        content: '리뷰 내용',
        bookId: createdBook._id,
      })
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.content).toEqual('리뷰 내용');
        createdReview = res.body;
      });
  });

  it('(GET) 모든 리뷰 조회', () => {
    return request(app.getHttpServer())
      .get('/reviews')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
      });
  });

  it('(GET) 리뷰 조회', () => {
    return request(app.getHttpServer())
      .get(`/reviews/${createdReview._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body._id).toEqual(createdReview._id);
      });
  });

  describe('(PATCH) 리뷰 수정', () => {
    it('본인 리뷰 수정', () => {
      const newContent = { content: '수정된 리뷰 내용' };

      return request(app.getHttpServer())
        .patch(`/reviews/${createdReview._id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newContent)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.content).toEqual('수정된 리뷰 내용');
        });
    });

    it('타인 리뷰 수정', () => {
      const newContent = { content: '수정된 리뷰 내용' };

      return request(app.getHttpServer())
        .patch(`/reviews/${createdReview._id}`)
        .set('Authorization', `Bearer ${anotherJwtToken}`)
        .send(newContent)
        .expect(403);
    });

    it('관리자가 리뷰 수정', () => {
      const newContent = { content: '수정된 리뷰 내용' };

      return request(app.getHttpServer())
        .patch(`/reviews/${createdReview._id}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(newContent)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.content).toEqual('수정된 리뷰 내용');
        });
    });
  });

  describe('(DELETE) 리뷰 삭제', () => {
    it('본인 리뷰 삭제', () => {
      return request(app.getHttpServer())
        .delete(`/reviews/${createdReview._id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.deleted).toEqual(true);
        });
    });
  });
});
