import { Controller, Get } from '@nestjs/common';
import { KeysService } from '../common/providers/keys.service';

@Controller('.well-known')
export class AuthWellKnownController {
  constructor(private readonly keysService: KeysService) {}

  @Get('jwks.json')
  async getJwks() {
    return await this.keysService.getJwks();
  }
}