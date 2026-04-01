const crypto = require('crypto');

class Hash {
  static sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}

module.exports = Hash;
