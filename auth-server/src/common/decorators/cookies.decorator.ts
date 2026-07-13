import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator(
    (cookieName: string, context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest<Request>();
        return cookieName ? req.cookies?.[cookieName] : req.cookies;
    },
);
