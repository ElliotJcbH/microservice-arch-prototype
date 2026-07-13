import { Injectable } from '@nestjs/common';
import { CreateUserFormDto } from './dto/create-user-form.dto';
import { SignInUserFormDto } from './dto/signin-user-form.dto';
import { SessionInfoDto } from './dto/session-info.dto';
import { TokenService } from './providers/token.service';
import ISessionInfo from '@interface/session-info.interface';
import { UserRecordService } from '@providers/user/user-record.service';
import IUserRecord from '@interface/user-record.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly userRecordService: UserRecordService,
    ) {}

    async register(formData: CreateUserFormDto): Promise<ISessionInfo> {
        const user: IUserRecord =
            await this.userRecordService.createUser(formData);
        const sessionInfo: ISessionInfo =
            await this.tokenService.createTokens(user);
        return sessionInfo;
    }

    async login(formData: SignInUserFormDto): Promise<SessionInfoDto> {
        const user: IUserRecord =
            await this.userRecordService.fetchUserWithSignInData(formData);
        return await this.tokenService.createTokens(user);
    }

    async logout(
        authorization: string,
        rawRefreshToken: string,
    ): Promise<boolean> {
        const requestToken: string = authorization.split(' ')[1];
        const isRefreshTokenDeleted: boolean =
            await this.tokenService.deleteRefreshToken(
                requestToken,
                rawRefreshToken,
            );

        return isRefreshTokenDeleted;
    }

    async renewToken(
        authorization: string,
        refreshToken: string,
    ): Promise<string> {
        const accessToken: string = authorization.split(' ')[1];
        const newAccessToken: string = await this.tokenService.renewAccessToken(
            accessToken,
            refreshToken,
        );

        return newAccessToken;
    }
}
