import { Controller, Post, Body, UnauthorizedException, Get, Headers, Delete, Head } from "@nestjs/common";
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
    async register(
        @Headers('authorization') authHeader: string,
        @Body() createUserDto: CreateUserForm
    ) {

        if(!authHeader || !authHeader.startsWith('Basic ')) {
            throw new UnauthorizedException('Missing or Invalid Credentials');
        }

        try {
            // 2. Extract the Base64 part
            const base64Credentials = authHeader.split(' ')[1];

            // 3. Decode Base64 to a UTF-8 string ("username:password")
            const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');

            // 4. Split the string by the colon delimiter
            const [username, password] = decoded.split(':');

            // 5. Use the credentials (e.g., validate against a database)
            return { username, password };
        
        } catch (error) {
            throw new UnauthorizedException('Failed to decode credentials');
        }   

    }

    // @Post('register')
    // async register(@Body() formData: CreateUserForm) {
        
    //     const user = await this.authService.register(formData);

    //     const sessionInfo = await this.tokenService.createTokens(user);
        
    //     return sessionInfo; 
    // }

    @Post('login')
    async login(@Body() formData: SignInUserForm) {

        const user = await this.authService.login(formData);

        const sessionInfo = await this.tokenService.createTokens(user);
        
        return sessionInfo;
    }

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