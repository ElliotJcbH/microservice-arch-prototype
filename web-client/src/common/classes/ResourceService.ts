import HttpError from './HttpError';
import type AuthService from './AuthService';
import type JWT from './JWT';

export default class ResourceService {

    constructor(
        private accessToken: JWT,
        private authService: AuthService,
    ) {}

    async request(
        ...args: Parameters<typeof fetch>
    ): Promise<Response | undefined> { 

        const [url, options = {}] = args;

        if(this.accessToken.isExpired()) {
            const res = await this.authService.renewAccessToken()
        };
        
        const headers = new Headers(options.headers);
        if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${this.accessToken.getToken()}`);
        }
        options.headers = headers;
 
        try {
            const res: Response = await fetch(url, { ...options });

            if(!res.ok) {
                throw new HttpError(res.status, res.statusText, res)
            }

            return res;

        } catch(e) {

            if(e instanceof HttpError) {
                this.handleRequestHttpError(e)
            }

        }

    }

    private async handleRequestHttpError(e: HttpError) {

        let res;

        switch(e.status) {
            case 401: 
            case 404:
                res = await this.authService.renewAccessToken();
                break;
        }

        return res; 

    } 

}