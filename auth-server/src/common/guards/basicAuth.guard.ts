import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class BasicAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        
        const req = context.switchToHttp().getRequest<Request>();
        const authHeader = req.headers.get('Authorization');

        if(!authHeader || !authHeader.startsWith('Basic ')) {
            throw new UnauthorizedException("Invalid creedentials");
        }

        
    }
}