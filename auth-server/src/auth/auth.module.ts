import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwksService } from './providers/jwks.service';
import { TokenService } from './providers/token.service';
import { TokenRecordService } from './providers/token-record.service';
import { AuthWellKnownController } from './auth.wellknown.controller';

@Module({
    imports: [],
    controllers: [AuthController, AuthWellKnownController],
    providers: [
        AuthService,
        TokenService,
        TokenRecordService,
        JwksService,
        // {
        //     provide: APP_INTERCEPTOR,
        //     useClass: RefreshTokenInterceptor
        // }, Interceptors are not injected into services, instead by doing this, i unintentionally made RefreshTokenInterceptor a module-level interceptor
    ],
    exports: [],
})
export class AuthModule {}
