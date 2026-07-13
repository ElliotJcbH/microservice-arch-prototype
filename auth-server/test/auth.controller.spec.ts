import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        register: jest.fn().mockResolvedValue({
            accessToken: 'mock-access-token',
            userId: '123',
            iat: 123456,
            exp: 789012,
        }),
    };

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService, // Replaces real AuthService
                },
            ],
        }).compile();

        controller = moduleRef.get<AuthController>(AuthController);
        authService = moduleRef.get<AuthService>(AuthService);
    });

    it('should return an access token, iat, exp, and user id in body', async () => {
        const dto = {
            email: 'elliot.jacob09@gmail.com',
            password: 'Password123!',
            username: 'rokketo',
        };
        const result = await controller.register(dto);

        console.log('--- REGISTER RESULT ---', result);
        expect(result).toHaveProperty('accessToken');
        // expect(result.user).toBeInstanceOf();
        expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
});
