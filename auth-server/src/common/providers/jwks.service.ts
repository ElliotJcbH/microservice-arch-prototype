import { Injectable } from "@nestjs/common";
import { KEY_STORE } from '../configs/jwt.keys.config';
import type { JSONWebKey } from "jwks-rsa";
import { pem2jwk } from "pem-jwk";

@Injectable()
export class JwksService {

    constructor(){}

    getJwks() {
        const keys: Array<JSONWebKey> = Object.keys(KEY_STORE.keys).map(kid => {
            const pem = KEY_STORE.keys[kid].publicKey;

            const jwk = pem2jwk(pem);
            
            return {
                ...jwk,
                kid,
                kty: 'RSA',
                use: 'sig',
                alg: 'RS256',
            }

        })

        return { keys }
    }

}