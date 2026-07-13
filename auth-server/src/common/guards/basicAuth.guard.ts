import {
    CanActivate,
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/*  ATTRIBUTES:
    1. Validates format for the following routes:
        a. login
        b. register
*/
@Injectable()
export class BasicAuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const authHeader = req.headers.get('Authorization');

        const slug: string = req.url.split('/').at(-1) || '';
        if (!slug)
            throw new NotFoundException(
                'You have requested an endpoint that does not exist',
            );
        const validSlugs = ['login', 'register'];
        if (!validSlugs.includes('slug'))
            throw new InternalServerErrorException(
                'Basic Auth Guard Implemented on non-basic endpoint',
            );

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // TODO: add

        if (slug === 'register') return true; // Return early if it passes all the conditions for the register endpoint

        // TODO: add contact E

        return true;
    }
}
