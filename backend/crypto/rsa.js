const crypto = require('crypto');

class RSA {
  static generateKeyPair() {
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
    
    return {
      publicKey,
      privateKey
    };
  }

  static encrypt(data, publicKey) {
    const buffer = Buffer.from(data, 'hex');
    const encrypted = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, buffer);
    
    return encrypted.toString('base64');
  }

  static decrypt(encryptedData, privateKey) {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, buffer);
    
    return decrypted.toString('hex');
  }
}

module.exports = RSA;
