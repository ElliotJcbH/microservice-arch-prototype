import * as fs from 'fs';
import * as path from 'path';

const keysDirectory = path.join(process.cwd(), 'keys'); // i.e. /auth-server/keys

export const KEY_STORE = {
    currentKeyId: 'v1',
    refresh_token_timer_ms: 1000 * 60 * 60 * 24 * 30, // 30 days
    access_token_timer_ms: 1000 * 10, // 10 seconds
    keys: {
        v1: {
            publicKey: fs.readFileSync(
                path.join(keysDirectory, 'v1', 'public.pem'),
            ),
            privateKey: fs.readFileSync(
                path.join(keysDirectory, 'v1', 'private.pem'),
            ),
        },
        // v2: {
        //     publicKey: fs.readFileSync(
        //         path.join(keysDirectory, 'v2', 'public.pem'),
        //     ),
        //     privateKey: fs.readFileSync(
        //         path.join(keysDirectory, 'v2', 'private.pem'),
        //     ),
        // },
    },
};
