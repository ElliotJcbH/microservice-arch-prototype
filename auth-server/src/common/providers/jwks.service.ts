import crypto from 'node:crypto';
import { Injectable } from "@nestjs/common";
import { KeysService } from './keys.service';
const jwksClient = require('jwks-rsa');

@Injectable()
export class JwksService {

    constructor(
        private readonly keysService: KeysService
    ){}

    getJwks() {
        const publicKey = crypto.createPublicKey(this.keysService.getPublicKey());
        return publicKey.export({ format: 'jwk' });
    }

    getPublicKeyFromJwks(jwks) {
        let client = jwksClient({
            jwksUri: ""
        })

        function getKey(header, callback){
        client.getSigningKey(header.kid, function(err, key) {
            var signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
        });
        }
    }

}