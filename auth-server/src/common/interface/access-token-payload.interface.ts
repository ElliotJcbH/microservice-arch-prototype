
export default interface IAccessTokenPayload {
    sub: string;
    email: string; 
    username: string;
    email_verified_at: Date;
    metadata: Record<string, unknown>;
    exp: number;
    iat: number;
    jti: string;
}