import type JWT from "./JWT";

export default class AuthService {
    // This is a class for accessing the authentication / authorization service api
    private authUrl = ''

    constructor(
        private accessToken: JWT
    ) {}

    async registerUser(email: string, password: string) {

        const credentials = btoa(`${email}:${password}`)

        const req = await fetch(this.authUrl, {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`
            },
        })

    }

    async renewAccessToken(): Promise<any> {



    }

    async registerTokens() {


        
    }

    async clearRefreshToken() {



    } 

}