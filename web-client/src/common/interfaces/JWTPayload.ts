
export default interface JWTPayload {
    body: {
        userId: string;
        role: string;
    };
    exp: number;
    iat: number;
}
