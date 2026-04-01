document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        tamperBtn: document.getElementById('tamperBtn'),
        cipherOutput: document.getElementById('cipherOutput'),
        statusIndicator: document.getElementById('statusIndicator'),
        receivedMessage: document.getElementById('receivedMessage'),
        verifyStatus: document.getElementById('verifyStatus')
    };

    const state = {
        messages: []
    };

    const showStatus = (message, type) => {
        if(!elements.statusIndicator) return;
        const dot = elements.statusIndicator.querySelector('.dot');
        const textArea = elements.statusIndicator.querySelector('.text');
        if(dot && textArea) {
            dot.className = `dot ${type}`;
            textArea.textContent = message;
            textArea.className = `text status-${type}`;
        }
    };

    const displayMessage = (message, type) => {
        if (type === 'receiver' && elements.receivedMessage) {
            elements.receivedMessage.textContent = message || "Không thể giải mã tin nhắn";
            elements.receivedMessage.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const updateWirePanel = (cipherText) => {
        if(elements.cipherOutput) {
            elements.cipherOutput.textContent = cipherText || "Đang chờ dữ liệu...";
            elements.cipherOutput.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const clearInput = () => {
        if(elements.messageInput) elements.messageInput.value = '';
    };

    const handleSend = async (tamper = false) => {
        const message = elements.messageInput.value.trim();
        if (!message) {
            alert('Vui lòng nhập tin nhắn!');
            return;
        }

        try {
            showStatus('Đang xử lý mã hóa...', 'processing');
            
            // 1. Send via API (Sender side encryption)
            const sendResult = await API.sendMessage(message, 'simple', tamper);
            
            // Display on wire
            updateWirePanel(sendResult.cipherText);
            
            showStatus('Đã truyền tải trên mạng rỗng', 'processing');

            // 2. Receive via API (Receiver side decryption)
            setTimeout(async () => {
                try {
                    const receiveResult = await API.receiveMessage(
                        sendResult.cipherText, 
                        sendResult.encryptedKey, 
                        sendResult.signature,
                        'simple'
                    );

                    displayMessage(receiveResult.decryptedMessage, 'receiver');
                    
                    if (receiveResult.verified) {
                        elements.verifyStatus.textContent = "✓ Chữ ký hợp lệ. Tin nhắn an toàn.";
                        elements.verifyStatus.className = "verify-status verify-success";
                        showStatus('Hoàn thành', 'valid');
                    } else {
                        elements.verifyStatus.textContent = "✗ CẢNH BÁO: Chữ ký không hợp lệ! Tin nhắn đã bị thay đổi.";
                        elements.verifyStatus.className = "verify-status verify-fail";
                        showStatus('Lỗi: Dữ liệu bị giả mạo', 'invalid');
                    }
                    
                    if (!tamper) clearInput();
                } catch (receiveError) {
                    elements.verifyStatus.textContent = "✗ Lỗi khi giải mã.";
                    elements.verifyStatus.className = "verify-status verify-fail";
                    showStatus('Giải mã thất bại', 'invalid');
                    console.error("Receive error:", receiveError);
                }
            }, 1000); // Simulate network delay
            
        } catch (error) {
            showStatus('Lỗi hệ thống', 'invalid');
            console.error("Send error:", error);
        }
    };

    // Event Listeners
    if(elements.sendBtn) elements.sendBtn.addEventListener('click', () => handleSend(false));
    if(elements.tamperBtn) elements.tamperBtn.addEventListener('click', () => handleSend(true));
});
