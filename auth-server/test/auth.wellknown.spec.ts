import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import JwksRsa, { JSONWebKey } from 'jwks-rsa';
import { AppModule } from 'src/app.module';
import request from 'supertest';

describe('WellKnown (E2E)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        await app.init();
    });

    it('/.well-known/jwks.json - (GET)', () => {
        return request(app.getHttpServer())
            .get('/.well-known/jwks.json')
            .expect(200)
            .then((response) => {
                console.log('JWKS', response.body?.keys);
                expect(response.body).toHaveProperty('keys');
                expect(response.body.keys).toBeInstanceOf(Array);
                expect(response.body.keys).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            n: expect.any(String),
                            e: expect.any(String),
                            kid: expect.any(String),
                            kty: 'RSA',
                            use: 'sig',
                            alg: 'RS256',
                        }),
                    ]),
                );
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
