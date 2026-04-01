const crypto = require('crypto');

class AES {
  static encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    
    let encryptedData = cipher.update(text, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    
    const ivHex = iv.toString('hex');
    
    return {
      iv: ivHex,
      encryptedData: encryptedData,
      fullCipher: `${ivHex}:${encryptedData}`
    };
  }

  static decrypt(encryptedData, key) {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format. Expected "iv:encryptedData".');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = AES;
