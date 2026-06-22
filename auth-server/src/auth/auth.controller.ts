import { Controller, Post, Body, UnauthorizedException, Get, Headers, Delete } from "@nestjs/common";
import { CreateUserForm } from "./dto/create-user-form.dto";
import { SignInUserForm } from "./dto/signin-user-form.dto";
import { AuthService } from "./auth.service";
import { TokenService } from "src/common/providers/token/token.service";

@Controller('auth') 
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly tokenService: TokenService,
    ) {}

    @Post('register')
    async register(@Body() formData: CreateUserForm) {
        
        const user = await this.authService.register(formData);

        const sessionInfo = await this.tokenService.createTokens(user);
        
        return sessionInfo; 
    }

    @Post('login')
    async login(@Body() formData: SignInUserForm) {

        const user = await this.authService.login(formData);

        const sessionInfo = await this.tokenService.createTokens(user);
        
        return sessionInfo;
    }

    // @Delete('logout')
    // async logout(@Body() logoutBody: { userId: string }) {

    //     const isRefreshTokenDeleted = await this.tokenService.deleteRefreshToken(logoutBody.userId);

    //     return {
    //         isRefreshTokenDeleted: isRefreshTokenDeleted
    //     }
    // }

    @Delete('logout')
    async logout(@Headers('authorization') authorization: string) {

        if (!authorization) {
            throw new UnauthorizedException('No authorization header');
        }

        const accessToken = authorization.split(' ')[1];

        if (!accessToken) {
            return { accessToken: null };
        }        
        const isRefreshTokenDeleted = await this.tokenService.deleteRefreshToken(accessToken);

        return {
            isRefreshTokenDeleted: isRefreshTokenDeleted
        }
    }

    @Get('verify')
    async verify(@Headers('authorization') authorization: string) { 

        if (!authorization) {
            throw new UnauthorizedException('No authorization header');
        }

        const accessToken = authorization.split(' ')[1];

        if (!accessToken) {
            return { accessToken: null };
        }

        const newAccessToken = await this.tokenService.verifyToken(accessToken);

        return {
            accessToken: newAccessToken
        };
    }

}