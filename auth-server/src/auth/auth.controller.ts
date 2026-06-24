import { Controller, Post, Body, Get, Headers, Delete, Head, UseGuards } from "@nestjs/common";
import { CreateUserForm } from "./dto/create-user-form.dto";
import { SignInUserForm } from "./dto/signin-user-form.dto";
import { AuthService } from "./auth.service";
import { SessionInfoDto } from "./dto/session-info.dto";
import { BearerAuthGuard } from "src/common/guards/bearerAuth.guard";

@Controller('auth') 
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    async register( @Body() createUserDto: CreateUserForm ): Promise<SessionInfoDto> {
        return await this.authService.register(createUserDto)
    }

    @Post('login')
    async login( @Body() formDataDto: SignInUserForm ) {
        return this.authService.login(formDataDto);
    }

    @UseGuards(BearerAuthGuard)
    @Delete('logout')
    async logout( @Headers('authorization') authorization: string ): Promise<boolean> {
        return await this.authService.logout(authorization);
    }

    @UseGuards(BearerAuthGuard)
    @Get('renewToken')
    async verifyTokens( @Headers('authorization') authorization: string ): Promise<string> { 
        return await this.authService.renewToken(authorization);
    }

}