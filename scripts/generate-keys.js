const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, '../backend/keys');

if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
}

function generateAndSaveKeyPair(name) {
    try {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        });

        fs.writeFileSync(path.join(keysDir, `${name}_public.pem`), publicKey);
        fs.writeFileSync(path.join(keysDir, `${name}_private.pem`), privateKey);

        console.log(`Success: Generated RSA key pair for ${name}`);
    } catch (error) {
        console.error(`Error generating keys for ${name}:`, error.message);
    }
}

console.log('Generating RSA key pairs...');
generateAndSaveKeyPair('sender');
generateAndSaveKeyPair('receiver');
console.log(`Keys have been saved to ${keysDir}`);
