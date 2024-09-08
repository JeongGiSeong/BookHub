import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { Role } from './../src/auth/enums/role.enum';

describe('BookController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdBook;

  const admin = {
    name: 'bookcontroller',
    email: 'bookcontroller@bookcontroller.com',
    password: 'bookcontroller',
    role: [Role.User, Role.Admin],
  };

  const url = { url: 'https://www.yes24.com/Product/Goods/77283734' };

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
  });

  it('/singup (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(admin)
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
        expect(res.body.title).toEqual('클린 아키텍처');
        createdBook = res.body;
      });
  });

  it('(GET) 책 목록 조회', () => {
    return request(app.getHttpServer())
      .get('/books')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
      });
  });

  it('(GET) 책 상세 조회', () => {
    return request(app.getHttpServer())
      .get(`/books/${createdBook._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body._id).toEqual(createdBook._id);
      });
  });

  it('(PUT) 책 정보 수정', () => {
    const newUrl = { url: 'https://www.yes24.com/Product/Goods/11681152' };

    return request(app.getHttpServer())
      .patch(`/books/${createdBook._id}`)
      .send(newUrl)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.title).toEqual('Clean Code 클린 코드');
      });
  });

  it('(DELETE) 책 삭제', () => {
    return request(app.getHttpServer())
      .delete(`/books/${createdBook._id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.deleted).toEqual(true);
      });
  });
});
