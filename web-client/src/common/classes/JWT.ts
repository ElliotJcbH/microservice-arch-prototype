import { jwtDecode } from 'node_modules/jwt-decode/build/cjs';
import type JWTPayload from '../interfaces/JWTPayload';

export default class JWT {

    private decodedToken: JWTPayload;

    constructor(
        private token: string
    ) {
        this.decodedToken = jwtDecode(this.token)
    }

    getToken() {
        return this.token
    }

    getUserId() {
        return this.decodedToken.body.userId
    }

    isExpired() {
        const unixTimeNow = Math.floor(Date.now() / 1000);

        const buffer = 10; 
        return (this.decodedToken.exp || 0) < (unixTimeNow + buffer);    
    }

}