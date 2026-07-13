import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@providers/database/database.service';

@Injectable()
export class TokenRecordService {
    constructor(private readonly db: DatabaseService) {}

    async createRefreshToken(
        userId: string,
        hashedRefreshToken: string,
        tokenExpiration: Date,
    ): Promise<boolean> {
        try {
            const query = `
                INSERT INTO auth.refresh_tokens(user_id, refresh_token, expires_at) 
                VALUES($1, $2, $3) 
                RETURNING refresh_token
            `;
            const result = await this.db.query(query, [
                userId,
                hashedRefreshToken,
                tokenExpiration,
            ]);
            if (result.rows && result.rows.length > 0) return true;
        } catch (e) {
            console.log("Error [Database Exception]", e);
            throw new InternalServerErrorException(
                e instanceof Error ? e.message : 'Unexpected error',
            );
        }

        throw new InternalServerErrorException();
    }

    async fetchHashedRefreshTokenWithUserId(userId: string): Promise<string> {
        let hashedRefreshToken: string;
        try {
            const query = `
                SELECT user_id, refresh_token, expires_at FROM auth.refresh_tokens
                WHERE user_id = $1
                LIMIT 1
            `;
            const result = await this.db.query(query, [userId]);
            hashedRefreshToken = result.rows[0].refresh_token;
        } catch (e) {
            console.log("Error [Database Exception]", e);
            throw new InternalServerErrorException(
                e instanceof Error ? e.message : 'Unexpected error',
            );
        }

        if (!hashedRefreshToken) throw new InternalServerErrorException();

        return hashedRefreshToken;
    }

    async deleteRefreshToken(userId: string): Promise<boolean> {
        try {
            const query = `
                DELETE FROM auth.refresh_tokens 
                WHERE user_id = $1
            `;
            const result = await this.db.query(query, [userId]);

            if (result.rowCount === 0) {
                console.log("Error [Not Found Exception] Failed to delete refresh token");
                throw new NotFoundException('Token not found or already invalidated');
            }

            return true;
        } catch (e) {
            console.log("Error [Database Exception]", e);
            throw new InternalServerErrorException(
                e instanceof Error ? e.message : 'Unexpected Error',
            );
        }
    }
}
