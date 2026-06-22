import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from 'fs';

@Injectable()
export class KeysService {
    // This class is used to supply private and public keys for signing and authentication

    private privateKey: string = '';
    private publicKey: string = '';

    constructor(private configService: ConfigService) {
        this.loadKeys();
    }

    private loadKeys() {
        const absPrivateKeyPath = this.configService.get<string>('PRIVATE_KEY_PATH');
        const absPublicKeyPath = this.configService.get<string>('PUBLIC_KEY_PATH');

        if(!absPrivateKeyPath || !absPublicKeyPath) {
            throw Error('Error in KeysService: Private or Public Keys not set.')
        }

        this.privateKey = fs.readFileSync(absPrivateKeyPath, 'utf8');
        this.publicKey = fs.readFileSync(absPublicKeyPath, 'utf8');
    }

    getPrivateKey(): string {
        return this.privateKey;
    }

    getPublicKey(): string {
        return this.publicKey;
    }

    getJwks(): any {
        return 
    }

}