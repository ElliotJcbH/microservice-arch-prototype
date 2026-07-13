import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import request from 'supertest';

describe('AuthController (E2E)', () => {
    let app: INestApplication;

    /*** 
        IMPORTANT: Change testEmail and testUsername upon every test run that includes /auth/register 
    ***/
    let testEmail: string = 'elliot.jacob32@gmail.com';
    let testPassword: string = 'Password123!';
    let testUsername: string = 'rokketo24';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        await app.init();
    });

    it('/auth/register (POST) - Should flow through entire app', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: testEmail,
                password: testPassword,
                username: testUsername,
            })
            .expect(201)
            .then((response) => {
                expect(response.body).toHaveProperty('accessToken');
                expect(response.headers['set-cookie']).toBeDefined();
                expect(response.headers['set-cookie']).toHaveLength(1);
                expect(response.headers['set-cookie'][0]).toMatch(
                    /^refresh_token=/,
                );
            });
    });

    it('/auth/login (POST) - Should flow through entire app', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testEmail,
                password: testPassword,
            })
            .expect(201)
            .then((response) => {
                expect(response.body).toHaveProperty('accessToken');
                expect(response.headers['set-cookie']).toBeDefined();
                expect(response.headers['set-cookie']).toHaveLength(1);
                expect(response.headers['set-cookie'][0]).toMatch(
                    /^refresh_token=/,
                );
            });
    });

    it('/auth/logout (POST) - Should flow through entire app', async () => {
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testEmail,
                password: testPassword,
            })
            .expect(201);

        const accessToken = loginResponse.body.accessToken;
        expect(accessToken).toBeDefined();
        const cookies = loginResponse.headers['set-cookie'];
        expect(cookies).toBeDefined();

        return request(app.getHttpServer())
            .post('/auth/logout')
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201)
            .then((response) => {
                expect(response).toBeTruthy();
            });
    });

    it.only('/auth/token (POST) - Should flow through entire app', async () => {
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testEmail,
                password: testPassword,
            })
            .expect(201);

        const accessToken = loginResponse.body.accessToken;
        expect(accessToken).toBeDefined();
        const cookies = loginResponse.headers['set-cookie'];
        expect(cookies).toBeDefined();

        return request(app.getHttpServer())
            .post('/auth/token')
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201)
            .then((response) => {
                console.log("/auth/token Response:", response.body);
                expect(response.body).toHaveProperty('accessToken');
                expect(response.body.accessToken).not.toEqual(accessToken);
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
