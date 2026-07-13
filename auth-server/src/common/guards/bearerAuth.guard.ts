import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { KEY_STORE } from '@configs/jwt.keys.config';
import { Reflector } from '@nestjs/core';
import { IGNORE_EXPIRATION_KEY } from '@decorators/ignore-access-token-expiration.decorator';
import { PUBLIC_ROUTE_KEY } from '@decorators/public-route.decorator';

/*  ATTRIBUTES:
    1. Validates and verifies access tokens.
    2. Public routes are ignored with the @IsPublicRoute decorator
    3. Token expiration can be ignored at verification with the 
    @IgnoreAccessTokenExpiration decorator
*/
@Injectable()
export class BearerAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {

        const isPublicRoute = this.reflector.getAllAndOverride<boolean>(
            PUBLIC_ROUTE_KEY,
            [context.getHandler(), context.getClass()],
        ) ?? false;
        if(isPublicRoute) return true;

        const ignoreExpiration = this.reflector.getAllAndOverride<boolean>(
            IGNORE_EXPIRATION_KEY,
            [context.getHandler(), context.getClass()],
        ) ?? false;

        const req = context.switchToHttp().getRequest<Request>();
        const headers = new Headers(req.headers);
        const authorization = headers.get('Authorization');

        if (!authorization || !authorization.startsWith('Bearer '))
            throw new UnauthorizedException();

        const token = authorization.split(' ').pop();

        if (!token) { 
            console.log("Error [Unauthorized] Missing access token in Authorization Header")
            throw new UnauthorizedException();
        }

        let accessTokenHeaders = jwt.decode(token, {
            complete: true,
        })?.header;
        let kid = accessTokenHeaders?.kid; // token key version (id)

        if (!kid) throw new UnauthorizedException('Invalid access token');

        try {
            jwt.verify(token, KEY_STORE.keys[kid].publicKey, {
                ignoreExpiration
            });
        } catch (e) {
            throw new UnauthorizedException(
                e instanceof Error ? e.message : 'Invalid access token',
            );
        }

        return true;
    }
}
