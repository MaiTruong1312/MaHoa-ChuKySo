const express = require('express');
const crypto = require('crypto');
const AES = require('../crypto/aes');
const RSA = require('../crypto/rsa');
const Hash = require('../crypto/hash');
const Signature = require('../crypto/signature');

const router = express.Router();

let senderKeys = null;
let receiverKeys = null;

// Fake DB for Replay Attacks
const usedNonces = new Set();
// Stats tracking
const tamperStats = { totalAttacks: 0, failedAttacks: 0, successRate: 0 };

// Generate key pairs for sender and receiver in memory
senderKeys = RSA.generateKeyPair();
receiverKeys = RSA.generateKeyPair();

router.get('/keys', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        senderPublicKey: senderKeys.publicKey,
        receiverPublicKey: receiverKeys.publicKey
      }
    });
  } catch (error) {
    console.error('Error fetching keys:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/send', (req, res) => {
  try {
    const { message, mode, tamper } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Generate new AES key
    const aesKey = AES.generateKey();
    
    // Encrypt message with AES
    const aesResult = AES.encrypt(message, aesKey);
    let cipherText = aesResult.fullCipher;
    
    // Encrypt AES key with receiver's public key
    const encryptedKey = RSA.encrypt(aesKey, receiverKeys.publicKey);
    
    // Create Hash of message
    const messageHash = Hash.sha256(message);
    
    // Create signature from hash with sender's private key
    const signature = Signature.sign(messageHash, senderKeys.privateKey);
    
    // Tamper if required
    if (tamper) {
      // replace the last character of cipherText
      cipherText = cipherText.slice(0, -1) + (cipherText.slice(-1) === 'a' ? 'b' : 'a');
    }

    const response = {
      success: true,
      data: {
        cipherText,
        encryptedKey,
        signature
      }
    };

    if (mode === 'advanced') {
      response.data.advanced = {
        originalMessage: message,
        hash: messageHash,
        aesKey: aesKey,
        aesIv: aesResult.iv,
        aesEncryptedData: aesResult.encryptedData
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error in /send:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/receive', (req, res) => {
  try {
    const { cipherText, encryptedKey, signature, mode } = req.body;
    
    if (!cipherText || !encryptedKey || !signature) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Decrypt AES key with receiver's private key
    const decryptedAesKey = RSA.decrypt(encryptedKey, receiverKeys.privateKey);
    
    // Decrypt message with AES
    const decryptedMessage = AES.decrypt(cipherText, decryptedAesKey);
    
    // Create hash of decrypted message
    const decryptedHash = Hash.sha256(decryptedMessage);
    
    // Verify signature with sender's public key
    const verified = Signature.verify(decryptedHash, signature, senderKeys.publicKey);

    const response = {
      success: true,
      data: {
        decryptedMessage,
        verified
      }
    };

    if (mode === 'advanced') {
      response.data.advanced = {
        decryptedAesKey,
        decryptedHash,
        verificationMessage: verified ? "Signature is valid. Message is authentic and intact." : "Signature verification failed! Message may be tampered."
      };
    }

    res.json(response);
  } catch (error) {
    // Chỉ in ra dòng cảnh báo ngắn gọn thay vì quăng nguyên cục Stack Trace đỏ chóe làm bạn giật mình
    console.warn(`[Bảo mật] Cảnh báo: Phát hiện dữ liệu giả mạo (Tamper) hoặc sai khóa! Lỗi gốc: ${error.message}`);
    
    res.status(200).json({ 
      success: true, 
      data: {
        decryptedMessage: 'DECRYPTION_FAILED',
        verified: false,
        advanced: req.body.mode === 'advanced' ? {
          error: error.message,
          verificationMessage: "Decryption failed or data tampered."
        } : undefined
      } 
    });
  }
});

// ==========================================
// TAMPER LAB ENDPOINTS
// ==========================================

// 1. Mã hoá gốc (Tamper Encrypt)
router.post('/tamper/encrypt', (req, res) => {
    try {
        const { message } = req.body;
        if (!message) throw new Error('Message is required');

        if (!senderKeys || !receiverKeys) {
            senderKeys = RSA.generateKeyPair();
            receiverKeys = RSA.generateKeyPair();
        }

        const aesKeyBuffer = crypto.randomBytes(32);
        const aesKey = aesKeyBuffer.toString('hex');

        // B1: AES Encrypt
        const cipherText = AES.encrypt(message, aesKey);
        
        // B2: RSA Encapsulate Key
        const encryptedKey = RSA.encrypt(aesKey, receiverKeys.publicKey);
        
        // B3: Hash & Signature
        const hash = Hash.sha256(message);
        const signature = Signature.sign(hash, senderKeys.privateKey);

        const timestamp = Date.now();
        const nonce = crypto.randomBytes(16).toString('hex');

        res.json({
            success: true,
            data: { originalMessage: message, aesKey, cipherText, signature, hash, timestamp, nonce }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Kiểm duyệt Server Hacker File (Tamper Verify)
router.post('/tamper/verify', (req, res) => {
    try {
        const { cipherText, signature, originalHash, encryptedKey, isBirthdayAttack, expectedHash } = req.body;
        
        tamperStats.totalAttacks++;

        // For birthday attacks, just verify hash collisions (demo only since true hash collision is hard to fake without breaking logic)
        if (isBirthdayAttack) {
            if (originalHash === expectedHash) {
               // Technically impossible via GUI input but to complete code logic
               return res.json({ verified: true, attackDetected: false, reason: "Hash collision found (Theoretical Phase)" });
            } else {
               tamperStats.failedAttacks++;
               return res.json({ verified: false, attackDetected: true, reason: "SHA-256 Collision Failed. Avalanche effect ensures unique outputs." });
            }
        }

        // Standard verification
        let decryptedAesKey;
        try {
            decryptedAesKey = RSA.decrypt(encryptedKey, receiverKeys.privateKey);
        } catch(e) {
            tamperStats.failedAttacks++;
            return res.json({ verified: false, attackDetected: true, reason: "RSA Decryption Failed: Invalid Encrypted Key Header." });
        }

        let decryptedMessage;

        try {
            decryptedMessage = AES.decrypt(cipherText, decryptedAesKey);
        } catch(e) {
            tamperStats.failedAttacks++;
            return res.json({ verified: false, attackDetected: true, reason: `AES Decryption Error (CBC Block corruption): ${e.message}` });
        }

        const calculatedHash = Hash.sha256(decryptedMessage);
        
        try {
            const isValid = Signature.verify(calculatedHash, signature, senderKeys.publicKey);
            if (!isValid) {
                tamperStats.failedAttacks++;
                return res.json({ 
                    verified: false, 
                    attackDetected: true, 
                    reason: "Digital Signature Invalid. Signature does not match calculated SHA-256 hash."
                });
            }
        } catch(e) {
            tamperStats.failedAttacks++;
            return res.json({ verified: false, attackDetected: true, reason: "Signature parsing failed (Bad Base64 or Corrupt Block)." });
        }

        // Technically if somehow they didn't alter anything to trigger an attack it passes
        res.json({ verified: true, decryptedMessage, newHash: calculatedHash, reason: "OK", attackDetected: false });
    } catch (err) {
        tamperStats.failedAttacks++;
        res.status(500).json({ verified: false, attackDetected: true, reason: `Fatal pipeline exception: ${err.message}` });
    }
});

// 3. Replay Attack Monitor
router.post('/tamper/replay-check', (req, res) => {
    const { nonce, timestamp } = req.body;
    tamperStats.totalAttacks++;

    const now = Date.now();
    const timeDiff = now - parseInt(timestamp);
    
    // Check if timestamp is older than 5 minutes (300000ms)
    if (timeDiff > 300000) {
        tamperStats.failedAttacks++;
        return res.json({ isReplay: true, message: "🚨 REPLAY DETECTED: Timestamp expired. Gói tin quá cũ (TTL Timeout)." });
    }

    if (usedNonces.has(nonce)) {
        tamperStats.failedAttacks++;
        return res.json({ isReplay: true, message: "🚨 REPLAY DETECTED: Nonce đã được sử dụng. Có kẻ đang Replay lại giao dịch cũ!" });
    }
    
    usedNonces.add(nonce);
    res.json({ isReplay: false, message: "Nonce hợp lệ. Package mới tinh." });
});

// 4. Lấy Statistics
router.get('/tamper/statistics', (req, res) => {
    res.json(tamperStats);
});

module.exports = router;
