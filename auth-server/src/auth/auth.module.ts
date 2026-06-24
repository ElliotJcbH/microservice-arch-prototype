import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "src/common/providers/token/token.service";
import { JwksService } from "src/common/providers/jwks.service";

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [AuthService, TokenService, JwksService,],
    exports: [],
})
export class AuthModule{}