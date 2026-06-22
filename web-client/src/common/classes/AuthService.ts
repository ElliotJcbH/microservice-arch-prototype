import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";

// This is a class for accessing the authentication / authorization service api
export default class AuthService {

    private constructor() {}

    static async registerUser(email: string, password: string) {

    }

    static async renewAccessToken(userId: string): Promise<any> {



    }

    static async registerTokens(userId: string) {


        
    }

    static async clearRefreshToken(userId: string) {



    } 

}