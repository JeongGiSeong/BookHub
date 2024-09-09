import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { Role } from './../src/auth/enums/role.enum';

describe('ReviewController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdBook;

  const user = {
    name: 'reviewcontroller',
    email: 'review@review.com',
    password: 'review',
    role: [Role.User],
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

  it('/singup (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(201)
      .then((res) => {
        expect(res.body.token).toBeDefined();
        jwtToken = res.body.token;
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

  it('(POST) 리뷰 생성', () => {});

  it('(GET) 모든 리뷰 조회', () => {});

  it('(GET) 리뷰 조회', () => {});

  it('(PATCH) 리뷰 수정', () => {});

  it('(DELETE) 리뷰 삭제', () => {});
});
