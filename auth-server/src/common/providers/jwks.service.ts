import { Injectable } from "@nestjs/common";
import { KEY_STORE } from '../configs/jwt.keys.config';
import type { JSONWebKey } from "jwks-rsa";
import { pem2jwk } from "pem-jwk";

@Injectable()
export class JwksService {

    constructor(){}

    getJwks() {
        // const publicKey = crypto.createPublicKey(this.keysService.getPublicKey());
        // return publicKey.export({ format: 'jwk' });

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

    // getPublicKeyFromJwks(jwks) {
    //     let client = jwksClient({
    //         jwksUri: ""
    //     })

    //     function getKey(header, callback){
    //     client.getSigningKey(header.kid, function(err, key) {
    //         var signingKey = key.publicKey || key.rsaPublicKey;
    //         callback(null, signingKey);
    //     });
    //     }
    // }

}