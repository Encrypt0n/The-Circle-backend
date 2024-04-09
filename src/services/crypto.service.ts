const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

function saveKeyToServer(key, fileName) {
    try {
        fs.writeFileSync(process.env.KEYS_DIRECTORY + fileName, key);
    } catch (err) {
        console.error(`Failed to save .pem file: ${err}`);
    }
}

module.exports = {
    createKeyPair(): Promise<any> {
        try {
            const { publicKey, privateKey } = generateKeyPairSync('rsa', {
                modulusLength: 2048
            });
    
            // Convert keys to PEM format
            const publicKeyPem = publicKey.export({
                type: 'pkcs1',
                format: 'pem',
            });
            const privateKeyPem = privateKey.export({
                type: 'pkcs1',
                format: 'pem',
            });
            
            saveKeyToServer(publicKeyPem, 'public_key');
            saveKeyToServer(privateKeyPem, 'private_key');

            return Promise.resolve(publicKeyPem)
        } catch (e) {
            return Promise.reject(e);
        }
    }
}