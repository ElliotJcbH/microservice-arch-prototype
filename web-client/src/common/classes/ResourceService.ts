import { jwtDecode } from 'node_modules/jwt-decode/build/cjs';
import HttpError from './HttpError';
import AuthService from './AuthService';

interface requestProps {
    url: string;
    options?: RequestInit;
    timeOutMs?: number 
}

export default class ResourceService {

    constructor() {}

    static async request({
        url,
        options = {},
        timeOutMs = 5000,
    }: requestProps): Promise<Response | undefined> {

        const accessToken = '';
        const decodedToken = jwtDecode(accessToken);
        const unixTimeNow = Math.floor(Date.now() / 1000);
        const isAccessTokenExpired = decodedToken.exp || 0 < unixTimeNow;

        if(isAccessTokenExpired) {

            res = await AuthService.renewAccessToken
        };
        
        const headers = new Headers(options.headers);
        options.headers = headers;

        try {
            const res: Response = await fetch(url, { ...options });

            if(!res.ok) {
                throw new HttpError(res.status, res.statusText, res)
            }

            return res

        } catch(e) {

            if(e instanceof HttpError) {
                this.handleRequestHttpError(e)
            }

        }

    }

    private static async handleRequestHttpError(e: HttpError) {

        let res;

        switch(e.status) {
            case 401: 
            case 404:
                res = await AuthService.renewAccessToken();
                break;
        }

        return res; 

    } 

}