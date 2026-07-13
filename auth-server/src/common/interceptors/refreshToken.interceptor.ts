import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Response } from 'express';
import { KEY_STORE } from "@configs/jwt.keys.config";
import { SessionInfoDto } from "src/auth/dto/session-info.dto";

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const res = context.switchToHttp().getResponse<Response>();

        return next
            .handle()
            .pipe(
                map((data: SessionInfoDto) => {
                    // console.log('INTERCEPTOR FIRED', data);
                    const { refreshToken, ...rest } = data;

                    res.cookie("refresh_token", refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'lax',
                        maxAge: KEY_STORE.refresh_token_timer_ms // 30 days
                    })

                    return {
                        ...rest
                    }
                })
            )
    }

}