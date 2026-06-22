import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "src/common/providers/token/token.service";
import { DatabaseService } from "src/common/providers/database/database.service";

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [AuthService, TokenService, DatabaseService],
    exports: [AuthService]
})
export class AuthModule{}