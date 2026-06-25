import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { hashPassword, verifyPassword } from "@utils/auth.utils";
import { SessionInfoDto } from "src/auth/dto/session-info.dto";
import SessionUserInfo from "@interface/session-user-info.interface";
import { DatabaseService } from "@providers/database/database.service";
import { KEY_STORE } from "@configs/jwt.keys.config";

const REFRESH_TOKEN_EXPIRATION_DAYS = 30; 
const ACCESS_TOKEN_EXPIRATION = '10s';

// TODO: Implement kid logic into access token header
@Injectable()
export class TokenService {

    constructor(
        private readonly db: DatabaseService,
        private readonly configService: ConfigService,
    ) {}

    async createTokens(data: Record<string, any>): Promise<SessionInfoDto> {

        const rawRefreshToken = await this.createRefreshToken(data);
        const signedAccessToken = await this.createAccessToken(data);
    
        return this.sessionBuilder(
            signedAccessToken,
            rawRefreshToken,
            data as SessionUserInfo
        )
    }
    
    createAccessToken(data: Record<string, any>): string {
    
        const privateKey = KEY_STORE.keys[KEY_STORE.currentKeyId].privateKey;
        const payload =  
        {
            user_id: data.user_id,
            email: data.email,
            username: data.username,
            email_is_verified: data.email_is_verified,
            metadata: data.metadata,
        }
        const options: jwt.SignOptions = 
        { 
            expiresIn: ACCESS_TOKEN_EXPIRATION,
            header: {
                alg: 'RS256',
                kid: KEY_STORE.currentKeyId,
            }
        } 
        const signedAccessToken = jwt.sign(payload, privateKey, options)

        return signedAccessToken;
    }

    async renewAccessToken(accessToken: string, rawRefreshToken: string): Promise<string> {

        let payload;
        let accessTokenHeaders = jwt.decode(accessToken, { complete: true })?.header;
        let kid = accessTokenHeaders?.kid;

        if(!kid) throw new UnauthorizedException('Invalid access token');
        
        try {
            payload = jwt.verify(accessToken, KEY_STORE.keys[kid].publicKey); 
        } catch(e) {
            throw new UnauthorizedException(e instanceof Error ? e.message : "Invalid access token");
        }
        const userId = payload.user_id;

        try {
            const query = `
                SELECT user_id, refresh_token, expires_at FROM auth.refresh_tokens
                WHERE user_id = $1
                LIMIT 1
            `
            const result = await this.db.query(query, [userId]);
            const hashedRefreshToken = result.rows[0].refresh_token;

            const isRefreshTokenValid = verifyPassword(rawRefreshToken, hashedRefreshToken);

            if(!isRefreshTokenValid) throw new UnauthorizedException("Refresh token invalid")
        } catch(e) {
            throw new InternalServerErrorException(e instanceof Error ? e.message :  "Unexpected error");
        }

        const newAccessToken = this.createAccessToken({
            user_id: payload.user_id,
            email: payload.email,
            username: payload.username,
            email_is_verified: payload.email_is_verified,
            metadata: payload.metadata
        })

        return newAccessToken;
    }

    async createRefreshToken(data: Record<string, any>): Promise<string> {

        const rawRefreshToken = crypto.randomBytes(32).toString('hex');
        const hashedRefreshToken: string = await hashPassword(rawRefreshToken);

        const result: boolean = await this.saveRefreshToken(data.user_id, hashedRefreshToken);

        if(!result) throw new InternalServerErrorException("Failed to create refresh token");

        return rawRefreshToken;
    }

    private async saveRefreshToken(userId: string, hashedRefreshToken: string): Promise<boolean> {
        
        const tokenExpiration = new Date();
        tokenExpiration.setDate(tokenExpiration.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS)

        try {
            const query = `
                INSERT INTO auth.refresh_tokens(user_id, refresh_token, expires_at) 
                VALUES($1, $2, $3) 
                RETURNING token_id
            `;
            const result = await this.db.query(query, [userId, hashedRefreshToken, tokenExpiration]);
            if(result.rows && result.rows.length > 0) return true;
        } catch(e) {
            throw new InternalServerErrorException(e instanceof Error ? e.message : "Unexpected error");
        }
        

        return false;
    }

    async deleteRefreshToken(accessToken: string, rawRefreshToken: string): Promise<boolean> { // TODO

        const userId = this.getUserIdFromToken(accessToken);

        try {
            const query1 = `
                SELECT refresh_token FROM auth.refresh_tokens 
                WHERE user_id = $1
                LIMIT 1
            `
            const result1 = await this.db.query(query1, [userId]);
            const hashedRefreshToken = result1.rows[0].refresh_token;

            const isRefreshTokenValid = verifyPassword(rawRefreshToken, hashedRefreshToken);

            if(!isRefreshTokenValid) throw new UnauthorizedException("Refresh token invalid"); // TODO: What would be the best way to handle this?  

            const query2 = `
                DELETE FROM auth.refresh_tokens 
                WHERE user_id = $1
            `
            const result = await this.db.query(query2, [userId]);
            if(result.rows && result.rows.length > 0) return true;
        } catch(e) {
            throw new InternalServerErrorException(e instanceof Error ? e.message : "Unexpected Error");
        }

        return false;
    }

    private sessionBuilder(signedAccessToken: string, rawRefreshToken: string, user: SessionUserInfo): SessionInfoDto {
        const { exp, iat } = this.parseToken(signedAccessToken);

        return {
            accessToken: signedAccessToken,
            refreshToken: rawRefreshToken,
            exp,
            iat,
            user
        }
    }

    private getUserIdFromToken(accessToken: string): string {
        const payload = jwt.verify(
            accessToken,
            this.configService.get<string>('JWT_SECRET'),
            {
                ignoreExpiration: true
            }
        );

        return payload.user_id;
    }

    parseToken(token: string): SessionUserInfo & { exp: number, iat: number } {
        const decoded = jwt.decode(token);

        if (!decoded || typeof decoded === 'string') {
            throw new UnauthorizedException('Invalid token format');
        }

        return decoded as SessionUserInfo & { exp: number, iat: number };
    }

}