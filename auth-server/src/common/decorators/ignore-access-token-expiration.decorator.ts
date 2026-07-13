/*  ATTRIBUTES:
    1. Works with bearerAuth.guard.ts
*/
import { SetMetadata } from '@nestjs/common';

export const IGNORE_EXPIRATION_KEY = 'ignoreExpiration';
export const IgnoreAccessTokenExpiration = () =>
    SetMetadata(IGNORE_EXPIRATION_KEY, true);
