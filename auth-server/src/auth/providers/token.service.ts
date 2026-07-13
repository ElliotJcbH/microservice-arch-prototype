import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { hashPassword, verifyHash } from '@utils/auth.utils';
import ISessionUser from '@interface/session-user.interface';
import { DatabaseService } from '@providers/database/database.service';
import { KEY_STORE } from '@configs/jwt.keys.config';
import IAccessTokenPayload from '@interface/access-token-payload.interface';
import ISessionInfo from '@interface/session-info.interface';
import IUserRecord from '@interface/user-record.interface';
import { TokenRecordService } from './token-record.service';

@Injectable()
export class TokenService {
    constructor(private readonly tokenRecordService: TokenRecordService) {}

    async createTokens(data: Record<string, any>): Promise<ISessionInfo> {
        const rawRefreshToken = await this.createRefreshToken(data);
        const signedAccessToken = await this.createAccessToken(data);

        return this.sessionBuilder(
            signedAccessToken,
            rawRefreshToken,
            data as ISessionUser,
        );
    }

    createAccessToken(data: Partial<IUserRecord>): string {
        const privateKey = KEY_STORE.keys[KEY_STORE.currentKeyId].privateKey;
        const customPayload: Pick<
            IAccessTokenPayload,
            'email' | 'username' | 'email_verified_at' | 'metadata'
        > = {
            email: data.email || '',
            username: data.username || '',
            email_verified_at: data.email_verified_at || new Date(),
            metadata: data.metadata || {},
        };
        const options: jwt.SignOptions = {
            expiresIn: `${KEY_STORE.access_token_timer_ms}ms`,
            subject: data.user_id,
            header: {
                alg: 'RS256',
                kid: KEY_STORE.currentKeyId,
            },
        };
        const signedAccessToken = jwt.sign(customPayload, privateKey, options);

        return signedAccessToken;
    }

    async renewAccessToken(
        accessToken: string,
        rawRefreshToken: string,
    ): Promise<string> {
        let payload = jwt.decode(accessToken) as IAccessTokenPayload;
        const userId = payload.sub;

        const hashedRefreshToken =
            await this.tokenRecordService.fetchHashedRefreshTokenWithUserId(
                userId,
            );

        const isRefreshTokenValid = verifyHash(
            rawRefreshToken,
            hashedRefreshToken,
        );

        if (!isRefreshTokenValid) {
            console.log('Error [Unauthorized Exception] Refresh token invalid');
            throw new UnauthorizedException('Refresh token invalid');
        }

        const newAccessToken = this.createAccessToken({
            user_id: payload.sub,
            email: payload.email,
            username: payload.username,
            email_verified_at: payload.email_verified_at,
            metadata: payload.metadata,
        });

        return newAccessToken;
    }

    async createRefreshToken(data: Record<string, any>): Promise<string> {
        const rawRefreshToken = crypto.randomBytes(32).toString('hex');
        const hashedRefreshToken: string = await hashPassword(rawRefreshToken);

        const result: boolean = await this.saveRefreshToken(
            data.user_id,
            hashedRefreshToken,
        );

        if (!result)
            throw new InternalServerErrorException(
                'Failed to create refresh token',
            );

        return rawRefreshToken;
    }

    private async saveRefreshToken(
        userId: string,
        hashedRefreshToken: string,
    ): Promise<boolean> {
        const tokenExpiration = new Date();
        tokenExpiration.setTime(
            tokenExpiration.getTime() + KEY_STORE.refresh_token_timer_ms,
        );

        const isRefreshTokenCreated =
            await this.tokenRecordService.createRefreshToken(
                userId,
                hashedRefreshToken,
                tokenExpiration,
            );
        return isRefreshTokenCreated;
    }

    async deleteRefreshToken(
        accessToken: string,
        rawRefreshToken: string,
    ): Promise<boolean> {
        const userId = this.getUserIdFromToken(accessToken);
        const hashedRefreshToken =
            await this.tokenRecordService.fetchHashedRefreshTokenWithUserId(
                userId,
            );

        const isRefreshTokenValid = verifyHash(
            rawRefreshToken,
            hashedRefreshToken,
        );

        if (!isRefreshTokenValid) {
            console.log('Error [Unauthorized]: Invalid Refresh Token');
            throw new UnauthorizedException('Refresh token invalid');
        }

        const isRefreshTokenDeleted =
            this.tokenRecordService.deleteRefreshToken(userId);
        return isRefreshTokenDeleted;
    }

    private sessionBuilder(
        signedAccessToken: string,
        rawRefreshToken: string,
        user: ISessionUser,
    ): ISessionInfo {
        const { exp, iat } = jwt.decode(
            signedAccessToken,
        ) as IAccessTokenPayload;

        return {
            accessToken: signedAccessToken,
            refreshToken: rawRefreshToken,
            exp,
            iat,
            user,
        } as ISessionInfo;
    }

    private getUserIdFromToken(accessToken: string): string {
        const payload = jwt.decode(accessToken) as IAccessTokenPayload;
        return payload.sub;
    }
}
