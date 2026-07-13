import { Controller, Get } from '@nestjs/common';
import { JwksService } from './providers/jwks.service';
import { IsPublicRoute } from '@decorators/public-route.decorator';

@Controller('.well-known')
export class AuthWellKnownController {
    constructor(private readonly jwksService: JwksService) {}

    @IsPublicRoute()
    @Get('jwks.json')
    async getJwks() {
        return await this.jwksService.getJwks();
    }
}
