import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CardController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: number;
  let deckId: number;
  let cardId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // Clean up database
    await prismaService.card.deleteMany();
    await prismaService.userDeck.deleteMany();
    await prismaService.deck.deleteMany();
    await prismaService.user.deleteMany();

    // Create test user
    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })
      .expect(201);

    userId = createUserResponse.body.id;

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    authToken = loginResponse.body.accessToken;

    // Create test deck
    const createDeckResponse = await request(app.getHttpServer())
      .post('/decks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Deck',
        description: 'A test deck for card testing',
        isPublic: false,
      })
      .expect(201);

    deckId = createDeckResponse.body.id;
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('POST /cards/deck/:deckId', () => {
    it('should create a new card', async () => {
      const cardData = {
        question: 'What is the capital of France?',
        answer: 'Paris',
      };

      const response = await request(app.getHttpServer())
        .post(`/cards/deck/${deckId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cardData)
        .expect(201);

      expect(response.body).toMatchObject({
        question: cardData.question,
        answer: cardData.answer,
        deckId,
        createdById: userId,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      cardId = response.body.id;
    });

    it('should return 400 for invalid card data', async () => {
      await request(app.getHttpServer())
        .post(`/cards/deck/${deckId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: '', // Empty question
          answer: 'Paris',
        })
        .expect(400);
    });

    it('should return 403 for unauthorized deck access', async () => {
      // Create another user
      const anotherUserResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'another@example.com',
          password: 'password123',
          name: 'Another User',
        })
        .expect(201);

      // Login as another user
      const anotherLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'another@example.com',
          password: 'password123',
        })
        .expect(200);

      const anotherToken = anotherLoginResponse.body.accessToken;

      await request(app.getHttpServer())
        .post(`/cards/deck/${deckId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          question: 'What is the capital of Germany?',
          answer: 'Berlin',
        })
        .expect(403);
    });
  });

  describe('GET /cards/deck/:deckId', () => {
    beforeEach(async () => {
      // Create some test cards
      await request(app.getHttpServer())
        .post(`/cards/deck/${deckId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: 'What is the capital of France?',
          answer: 'Paris',
        });

      await request(app.getHttpServer())
        .post(`/cards/deck/${deckId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: 'What is the capital of Germany?',
          answer: 'Berlin',
        });
    });

    it('should return all cards from a deck', async () => {
      const response = await request(app.getHttpServer())
        .get(`/cards/deck/${deckId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        question: expect.any(String),
        answer: expect.any(String),
        deckId,
        createdById: userId,
      });
    });
  });

  describe('GET /cards/:cardId', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/cards/deck/${deckId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: 'What is the capital of France?',
          answer: 'Paris',
        });

      cardId = response.body.id;
    });

    it('should return a specific card', async () => {
      const response = await request(app.getHttpServer())
        .get(`/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: cardId,
        question: 'What is the capital of France?',
        answer: 'Paris',
        deckId,
        createdById: userId,
      });
    });

    it('should return 404 for non-existent card', async () => {
      await request(app.getHttpServer())
        .get('/cards/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /cards/:cardId', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/cards/deck/${deckId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: 'What is the capital of France?',
          answer: 'Paris',
        });

      cardId = response.body.id;
    });

    it('should delete a card', async () => {
      await request(app.getHttpServer())
        .delete(`/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify card is deleted
      await request(app.getHttpServer())
        .get(`/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent card', async () => {
      await request(app.getHttpServer())
        .delete('/cards/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
