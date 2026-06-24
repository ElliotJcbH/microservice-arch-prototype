import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

// This guard checks if the Auth Header with type "Bearer" follows a valid format
// It DOES NOT verify the token that comes with the bearer
@Injectable()
export class BearerAuthGuard implements CanActivate {

    constructor(){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const headers = new Headers(req.headers);
        const authorization = headers.get('Authorization');

        if(!authorization || !authorization.startsWith("Bearer ")) return false;

        const token = authorization.split(' ').pop();

        if(!token) return false;

        return true;
    }
}