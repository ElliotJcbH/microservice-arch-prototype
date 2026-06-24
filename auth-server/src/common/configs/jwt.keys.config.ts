import * as fs from 'fs';

export const KEY_STORE = {
    currentKeyId: 'v1',
    keys: {
        'v1': {
            publicKey: fs.readFileSync('./keys/v1/public.pem'),
            privateKey: fs.readFileSync('./keys/v1/private.pem'),
        }
    }

}