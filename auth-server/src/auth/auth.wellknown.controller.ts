import { Controller, Get } from '@nestjs/common';
import { JwksService } from './providers/jwks.service';

@Controller('.well-known')
export class AuthWellKnownController {
    constructor(private readonly jwksService: JwksService) {}

    @Get('jwks.json')
    async getJwks() {
        return await this.jwksService.getJwks();
    }
}
