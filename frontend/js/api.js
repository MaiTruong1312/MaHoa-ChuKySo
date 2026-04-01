const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Send message to backend to be encrypted and signed
 */
async function sendMessage(message, mode = 'simple', tamper = false) {
    try {
        const response = await fetch(`${API_BASE_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, mode, tamper })
        });
        
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to send message');
        }
        
        return result.data;
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

/**
 * Send ciphertext to backend to be decrypted and verified
 */
async function receiveMessage(cipherText, encryptedKey, signature, mode = 'simple') {
    try {
        const response = await fetch(`${API_BASE_URL}/receive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cipherText, encryptedKey, signature, mode })
        });
        
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to receive message');
        }
        
        return result.data;
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

/**
 * Get public keys for Sender and Receiver
 */
async function getPublicKeys() {
    try {
        const response = await fetch(`${API_BASE_URL}/keys`);
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to fetch keys');
        }
        
        return result.data;
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

/**
 * Helper to display errors (can be overridden by UI logic)
 */
function showError(message) {
    console.error(`[API Error]: ${message}`);
    if (window.onApiError) {
        window.onApiError(message);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendMessage, receiveMessage, getPublicKeys };
} else {
    window.API = { sendMessage, receiveMessage, getPublicKeys };
}
