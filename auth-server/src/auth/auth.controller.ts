import {
    Controller,
    Post,
    Body,
    Get,
    Headers,
    Delete,
    UseInterceptors,
} from '@nestjs/common';
import { CreateUserFormDto } from './dto/create-user-form.dto';
import { SignInUserFormDto } from './dto/signin-user-form.dto';
import { AuthService } from './auth.service';
import { SessionInfoDto } from './dto/session-info.dto';
import { RefreshTokenInterceptor } from '@interceptors/refreshToken.interceptor';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { plainToInstance } from 'class-transformer';
import { IgnoreAccessTokenExpiration } from '@decorators/ignore-access-token-expiration.decorator';
import { IsPublicRoute } from '@decorators/public-route.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @IsPublicRoute()
    @Post('register')
    @UseInterceptors(RefreshTokenInterceptor)
    async register(
        @Body() createUserDto: CreateUserFormDto,
    ): Promise<SessionInfoDto> {
        const sessionInfo = await this.authService.register(createUserDto);
        return plainToInstance(SessionInfoDto, sessionInfo);
    }

    @IsPublicRoute()
    @Post('login')
    @UseInterceptors(RefreshTokenInterceptor)
    async login(
        @Body() formDataDto: SignInUserFormDto,
    ): Promise<SessionInfoDto> {
        const sessionInfo = await this.authService.login(formDataDto);
        return plainToInstance(SessionInfoDto, sessionInfo);
    }

    @IgnoreAccessTokenExpiration()
    @Post('logout')
    async logout(
        @Headers('authorization') authorization: string,
        @Cookies('refresh_token') refreshToken: string,
    ): Promise<boolean> {
        return await this.authService.logout(authorization, refreshToken);
    }

    // refreshes access token
    @IgnoreAccessTokenExpiration()
    @Post('token')
    async verifyTokens(
        @Headers('authorization') authorization: string,
        @Cookies('refresh_token') refreshToken: string,
    ): Promise<string> {
        return await this.authService.renewToken(authorization, refreshToken);
    }
}
