import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from 'jsonwebtoken';
import { SessionInfoDto } from "src/auth/dto/session-info.dto";
import SessionUserInfo from "src/common/interface/session-user-info.interface";
import { DatabaseService } from "src/common/providers/database/database.service";

const REFRESH_TOKEN_EXPIRATION = '30d';
const ACCESS_TOKEN_EXPIRATION = '10s';

@Injectable()
export class TokenService {

     constructor(
        private readonly db: DatabaseService,
        private configService: ConfigService
      ) {}

    async createTokens(data: Record<string, any>): Promise<SessionInfoDto> {

        const refreshToken = await this.createRefreshToken(data);
        const accessToken = await this.createAccessToken(data);
    
        return this.sessionBuilder(
            accessToken,
            refreshToken,
            data as SessionUserInfo
        )
    }

    async createRefreshToken(data: Record<string, any>) {
        const refreshToken = jwt.sign(
            {
                user_id: data.user_id,
                email: data.email,
                username: data.username,
                email_is_verified: data.email_is_verified,
                metadata: data.metadata
            },
            this.configService.get<string>('JWT_SECRET'),
            {expiresIn: REFRESH_TOKEN_EXPIRATION }
        )

        await this.saveRefreshToken(data.user_id, refreshToken);

        return refreshToken;
    }
    
    createAccessToken(data: Record<string, any>) {
        const accessToken = jwt.sign(
            {
                user_id: data.user_id,
                email: data.email,
                username: data.username,
                email_is_verified: data.email_is_verified,
                metadata: data.metadata
            },
            this.configService.get<string>('JWT_SECRET'),
            { expiresIn: ACCESS_TOKEN_EXPIRATION } 
        )

        return accessToken;
    }

    async verifyToken(accessToken: string): Promise<string | null> {
        
        const userId = this.parseToken(accessToken).user_id;

        const validAccessPayload = await this.verifyAccessToken(accessToken);
        if(validAccessPayload) return accessToken;
        
        const validRefreshPayload = await this.verifyRefreshToken(userId);
        if(validRefreshPayload) {
            return this.createAccessToken(validRefreshPayload); // this returns an access token
        }

        return null; // user has to re-do authorization steps
    }

    private async verifyAccessToken(accessToken: string) {

        try {
            const payload = jwt.verify(
                accessToken, 
                this.configService.get<string>('JWT_SECRET'),
            );    

            return payload;
        } catch (error) {
            return null;
        }

    }

    private async verifyRefreshToken(userId: string) {
        try {
            const query = 'SELECT * FROM auth.refresh_tokens WHERE user_id = $1';
            const result = await this.db.query(query, [userId]);
            
            if (!result.rows.length) {
                return null; 
            }
            
            const refreshToken = result.rows[0].token_id;
            const payload = jwt.verify(
                refreshToken,
                this.configService.get<string>('JWT_SECRET'),
            );

            return payload;
        } catch (error) {
            return null;
        }
    }

    private async saveRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
        
        const query = 'INSERT INTO auth.refresh_tokens(token_id, user_id) VALUES($1, $2) RETURNING token_id';

        if(await this.db.query(query, [refreshToken, userId])[0]) return true;

        return false;
    }

    async deleteRefreshToken(accessToken: string): Promise<boolean> {

        const payload = jwt.verify(
            accessToken,
            this.configService.get<string>('JWT_SECRET'),
            {
                ignoreExpiration: true
            }
        );
        console.log('Payload', payload);
        const userId = payload.user_id;

        const query = 'DELETE FROM auth.refresh_tokens WHERE user_id = $1';
        const result = await this.db.query(query, [userId]);
        if((result.rowCount || 0) > 0) {
            return true;
        }

        return false;
    }

    private sessionBuilder(accessToken: string, refreshToken: string, user: SessionUserInfo) {
        const { exp, iat } = this.parseToken(accessToken);

        return {
            accessToken,
            refreshToken,
            exp,
            iat,
            user
        }
    }

    parseToken(token: string): SessionUserInfo & { exp: number, iat: number } {
        const decoded = jwt.decode(token);

        if (!decoded || typeof decoded === 'string') {
            throw new UnauthorizedException('Invalid token format');
        }

        return decoded as SessionUserInfo & { exp: number, iat: number };
    }

}