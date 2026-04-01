document.addEventListener('DOMContentLoaded', () => {

    const elements = {
        enc: {
            msg: document.getElementById('inpOriginalMsg'),
            btnRand: document.getElementById('btnRandomMsg'),
            btnEncrypt: document.getElementById('btnEncrypt'),
            cipher: document.getElementById('valCipherText'),
            sig: document.getElementById('valSignature'),
            hash: document.getElementById('valHash'),
            key: document.getElementById('dispAesKey'),
            encKey: document.getElementById('valEncryptedKey'),
            nonce: document.getElementById('valNonce'),
            ts: document.getElementById('valTimestamp'),
            rstCipher: document.getElementById('resetCipher'),
            rstSig: document.getElementById('resetSignature'),
        },
        tabs: document.querySelectorAll('.tab-btn'),
        contents: document.querySelectorAll('.tab-content'),
        console: document.getElementById('terminalLog'),
        typewriter: document.getElementById('typewriterNode'),
        stats: {
            total: document.getElementById('sTotal'),
            blocked: document.getElementById('sBlocked'),
            hacked: document.getElementById('sHacked'),
            rate: document.getElementById('sRate')
        },
        cipher: {
            pos: document.getElementById('cipherPos'),
            char: document.getElementById('cipherChar'),
            btn: document.getElementById('btnExecuteCipher')
        },
        sig: {
            input: document.getElementById('fakeSignatureVal'),
            btnRand: document.getElementById('btnFakeSigGen'),
            btnExec: document.getElementById('btnExecuteSignature'),
            btnForce: document.getElementById('btnBruteForce')
        },
        replay: {
            dNonce: document.getElementById('dispNonce'),
            dTs: document.getElementById('dispTimestamp'),
            btnExec: document.getElementById('btnExecuteReplay')
        },
        birthday: {
            m1: document.getElementById('bdMsg1'),
            m2: document.getElementById('bdMsg2'),
            btnExec: document.getElementById('btnExecuteBirthday')
        }
    };

    let originalState = {};

    // ==========================================
    // UTILITIES & ANIMATIONS
    // ==========================================

    const logConsole = (message, type = 'info') => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        let colorClass = 'log-info';
        if(type === 'error') colorClass = 'log-error';
        if(type === 'success') colorClass = 'log-success';
        if(type === 'warning') colorClass = 'log-warning';

        const newLine = document.createElement('div');
        newLine.className = 'console-line';
        if(type === 'error') newLine.classList.add('shake');
        
        newLine.innerHTML = `<span class="log-time">[${time}]</span> <span class="${colorClass}">${message}</span>`;
        
        elements.console.insertBefore(newLine, elements.typewriter);
        elements.console.scrollTop = elements.console.scrollHeight;
    };

    const generateRandomWords = () => {
        const words = ['Giao dịch', 'Chuyển khoản', 'Mật lệnh', 'Kích hoạt', 'Hủy bỏ', 'Alice', 'Bob', '100$', '9999$'];
        return `${words[Math.floor(Math.random()*words.length)]} ${words[Math.floor(Math.random()*words.length)]} ${Date.now().toString().slice(-4)}`;
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/tamper/statistics');
            const data = await res.json();
            elements.stats.total.textContent = data.totalAttacks;
            elements.stats.blocked.textContent = data.failedAttacks;
            elements.stats.hacked.textContent = data.totalAttacks - data.failedAttacks;
            const rate = data.totalAttacks > 0 ? ((data.failedAttacks / data.totalAttacks) * 100).toFixed(0) : 100;
            elements.stats.rate.textContent = `${rate}%`;
            
            if (rate < 100) elements.stats.rate.className = "stat-value text-red";
        } catch(e) {}
    };

    // TAB LOGIC
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.tabs.forEach(t => t.classList.remove('active'));
            elements.contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // ==========================================
    // STEP 1: ENCRYPT (Mã Hóa - Cột Trái)
    // ==========================================

    elements.enc.btnRand.addEventListener('click', () => {
        elements.enc.msg.value = generateRandomWords();
    });

    elements.enc.btnEncrypt.addEventListener('click', async () => {
        const msg = elements.enc.msg.value.trim();
        if(!msg) return alert('Input message needed.');
        
        logConsole(`Initializing Cryptosystem...`, 'info');
        try {
            const res = await fetch('http://localhost:3000/api/tamper/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const responseData = await res.json();
            
            if (!responseData.success) {
                return logConsole(`API Response Error: ${responseData.message}`, 'error');
            }
            const data = responseData.data;
            
            originalState = { ...data }; // backup
            
            elements.enc.key.value = data.aesKey;
            elements.enc.cipher.value = data.cipherText;
            elements.enc.sig.value = data.signature;
            elements.enc.hash.value = data.hash;
            elements.enc.encKey.value = data.encryptedKey;
            elements.enc.nonce.value = data.nonce;
            elements.enc.ts.value = data.timestamp;

            elements.replay.dNonce.textContent = data.nonce;
            elements.replay.dTs.textContent = data.timestamp;

            logConsole(`Gói tin (Payload) đã chuẩn bị xong. Mạng Node B đang nghe.`, 'success');

        } catch(e) {
            logConsole(`Lỗi kết nối Server Cipher: ${e.message}`, 'error');
        }
    });

    elements.enc.rstCipher.addEventListener('click', () => {
        if(originalState.cipherText) elements.enc.cipher.value = originalState.cipherText;
    });
    elements.enc.rstSig.addEventListener('click', () => {
        if(originalState.signature) elements.enc.sig.value = originalState.signature;
    });


    // ==========================================
    // ATTACK VECTORS (Cột Phải)
    // ==========================================

    const executeVerifyAttack = async (payload) => {
        if(!payload.cipherText || !payload.signature || !payload.encryptedKey) {
            return logConsole(`Hacker Error: Vui lòng click "Mã Hoá" bên trái trước để lấy packet!`, 'warning');
        }

        logConsole(`Sending malicious packet to Node B...`, 'warning');
        try {
            const res = await fetch('http://localhost:3000/api/tamper/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!data.verified && data.attackDetected) {
                logConsole(`BLOCKED: ${data.reason}`, 'error');
            } else {
                logConsole(`SUCCESS: Hệ thống bị thủng! Decrypted Message: ${data.decryptedMessage}`, 'success');
            }
            fetchStats();
        } catch(e) {
            logConsole(`Server Crash (Denial of Service?): ${e.message}`, 'error');
        }
    };

    // 1. TAMPER CIPHER
    elements.cipher.btn.addEventListener('click', () => {
        let cipherText = elements.enc.cipher.value;
        const pos = parseInt(elements.cipher.pos.value) || 0;
        const char = elements.cipher.char.value;

        if (cipherText.length === 0) return logConsole("Chưa có data Cipher!", 'warning');
        if (pos < 0 || pos >= cipherText.length) return logConsole(`Byte index ${pos} out of range.`, 'error');

        // Modify cipher visually
        cipherText = cipherText.substring(0, pos) + char + cipherText.substring(pos + 1);
        elements.enc.cipher.value = cipherText;
        
        logConsole(`Tampering Cipher Byte [${pos}] -> '${char}'. Executing payload...`, 'info');

        executeVerifyAttack({
            cipherText: cipherText,
            signature: elements.enc.sig.value,
            encryptedKey: elements.enc.encKey.value,
            originalHash: elements.enc.hash.value
        });
    });

    // 2. TAMPER SIGNATURE
    elements.sig.btnRand.addEventListener('click', () => {
        elements.sig.input.value = "Z2liYmVyaXNoX2hhY2tlcl9iYXNlNjRfYmxvY2tfZGF0YV9mb3JfZGVtbw==";
    });
    
    elements.sig.btnForce.addEventListener('click', () => {
        logConsole("Khởi chạy Tiến trình Brute Force RSA-2048...", 'warning');
        setTimeout(() => logConsole("Estimated Time Remaining: 300,000,000,000,000 Years.", 'error'), 1000);
    });

    elements.sig.btnExec.addEventListener('click', () => {
        const fakeSig = elements.sig.input.value.trim();
        if(!fakeSig) return logConsole("Vui lòng nhập fake signature!", 'warning');

        elements.enc.sig.value = fakeSig;
        logConsole(`Tampering Signature Block. Executing payload...`, 'info');

        executeVerifyAttack({
            cipherText: elements.enc.cipher.value,
            signature: fakeSig,
            encryptedKey: elements.enc.encKey.value,
            originalHash: elements.enc.hash.value
        });
    });

    // 3. REPLAY ATTACK (RESEND)
    elements.replay.btnExec.addEventListener('click', async () => {
        const nonce = elements.enc.nonce.value;
        const ts = elements.enc.ts.value;
        if(!nonce) return logConsole("Không có tín hiệu Nonce để Replay!", 'warning');

        logConsole(`Replaying Nonce ${nonce.substring(0,8)}... vào cổng API/Banking.`, 'warning');
        
        try {
            const res = await fetch('http://localhost:3000/api/tamper/replay-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nonce, timestamp: ts })
            });
            const data = await res.json();
            
            if (data.isReplay) {
                logConsole(`${data.message}`, 'error');
            } else {
                logConsole(`Giao dịch đầu tiên thành công! Giao dịch hợp lệ.`, 'success');
                fetchStats(); // Update stats
            }
            fetchStats();
        } catch(e) {
            logConsole(`Lỗi mạng: ${e.message}`, 'error');
        }
    });

    // 4. BIRTHDAY COLLISION
    elements.birthday.btnExec.addEventListener('click', () => {
        const msg1 = elements.birthday.m1.value;
        const msg2 = elements.birthday.m2.value;

        logConsole(`Testing SHA-256 Collision Hash Vector...`, 'info');
        
        // Pseudo logic calling backend to fake collide
        executeVerifyAttack({
            cipherText: elements.enc.cipher.value,
            signature: elements.enc.sig.value,
            encryptedKey: elements.enc.encKey.value,
            originalHash: originalState.hash,
            isBirthdayAttack: true,
            expectedHash: msg1 === msg2 ? originalState.hash : "fake_hash_trigger"
        });
    });

    // Init fetch
    fetchStats();
    setInterval(fetchStats, 5000);

});
