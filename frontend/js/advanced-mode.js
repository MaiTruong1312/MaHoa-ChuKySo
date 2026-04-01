document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        input: document.getElementById('advMessageInput'),
        sendBtn: document.getElementById('advSendBtn'),
        tamperBtn: document.getElementById('advTamperBtn'),
        wire: {
            cipher: document.getElementById('wireCipherText'),
            key: document.getElementById('wireEncryptedKey'),
            sig: document.getElementById('wireSignature')
        },
        receive: {
            msg: document.getElementById('advReceivedMessage'),
            status: document.getElementById('advVerifyStatus')
        }
    };

    let tamperMode = false;

    const setStepStatus = (stepId, status) => {
        const dot = document.getElementById(`${stepId}Status`);
        if (dot) {
            dot.className = `status-dot ${status}`;
        }
    };

    const updateStepData = (elementId, data) => {
        const el = document.getElementById(elementId);
        if (el) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = data;
            } else {
                el.textContent = data;
            }
        }
    };

    const reset = () => {
        if (elements.wire.cipher) elements.wire.cipher.textContent = '...';
        if (elements.wire.key) elements.wire.key.textContent = '...';
        if (elements.wire.sig) elements.wire.sig.textContent = '...';
        if (elements.receive.msg) elements.receive.msg.textContent = '...';
        if (elements.receive.status) {
            elements.receive.status.textContent = 'Đang chờ...';
            elements.receive.status.className = 'status-badge';
        }

        for (let i = 1; i <= 9; i++) {
            setStepStatus(`step${i}`, 'default');
            const content = document.getElementById(`step${i}`);
            if (content) content.style.display = 'none';

            if (i === 1) updateStepData('step1Data', '');
            if (i === 2) updateStepData('step2Data', '');
            if (i === 3) updateStepData('step3Data', '');
            if (i === 4) { updateStepData('step4Iv', ''); updateStepData('step4Data', ''); }
            if (i === 5) updateStepData('step5Data', '');
            if (i === 6) updateStepData('step6Data', '');
            if (i === 7) updateStepData('step7Data', '');
            if (i === 8) { updateStepData('step8Msg', ''); updateStepData('step8Hash', ''); }
            if (i === 9) {
                updateStepData('step9Result', '');
                const box = document.getElementById('step9Result');
                if (box) box.className = 'verification-box';
            }
        }
    };

    const showAdvancedInfo = (advData) => {
        updateStepData('step1Data', advData.originalMessage);
        updateStepData('step2Data', advData.hash);
        setStepStatus('step2', 'success');
        updateStepData('step3Data', advData.aesKey);
        updateStepData('step4Iv', advData.aesIv);
        updateStepData('step4Data', advData.aesEncryptedData);
        setStepStatus('step4', 'success');
    };



    const handleSend = async (isTamper) => {
        tamperMode = isTamper;
        const message = elements.input.value.trim();
        if (!message) {
            alert('Vui lòng nhập tin nhắn!');
            return;
        }

        reset();

        try {
            // STEP A: SEND
            const sendResult = await API.sendMessage(message, 'advanced', isTamper);

            // Update Wire
            elements.wire.cipher.textContent = sendResult.cipherText;
            elements.wire.key.textContent = sendResult.encryptedKey;
            elements.wire.sig.textContent = sendResult.signature;

            // Update Sending Steps (1-6) from advanced data
            const advData = sendResult.advanced;
            showAdvancedInfo(advData);

            updateStepData('step5Data', sendResult.encryptedKey);
            setStepStatus('step5', 'success');

            updateStepData('step6Data', sendResult.signature);
            setStepStatus('step6', 'success');

            for (let i = 1; i <= 9; i++) {
                const step = document.getElementById(`step${i}`);
                if (step) step.style.display = 'block';
            }

            // STEP B: RECEIVE (simulate network delay)
            setTimeout(async () => {
                let isTampered = isTamper;
                let recvAdvData = null;
                let receivedVerified = false;

                try {
                    const receiveResult = await API.receiveMessage(
                        sendResult.cipherText,
                        sendResult.encryptedKey,
                        sendResult.signature,
                        'advanced'
                    );

                    elements.receive.msg.textContent = receiveResult.decryptedMessage;
                    receivedVerified = receiveResult.verified;

                    if (receiveResult.verified) {
                        elements.receive.status.textContent = "Hợp lệ - An Toàn Tín";
                        elements.receive.status.className = "status-badge success-badge";
                        elements.receive.status.style.color = "white";
                        elements.receive.status.style.backgroundColor = "#27ae60";
                    } else {
                        elements.receive.status.textContent = "Bị giả mạo - Hủy dữ liệu!";
                        elements.receive.status.className = "status-badge error-badge";
                        elements.receive.status.style.color = "white";
                        elements.receive.status.style.backgroundColor = "#c0392b";
                    }

                    recvAdvData = receiveResult.advanced;
                    showDecryptionInfo(recvAdvData, receivedVerified, sendResult.advanced.hash);
                } catch (rErr) {
                    console.error("Receive err:", rErr);
                    elements.receive.msg.textContent = "Hệ thống sụp - Exception C++ Thrown (Bad Decrypt)";
                    elements.receive.status.textContent = "FATAL ERROR TAMPER DETECTED";
                     
                    // Simulate visual rejection for the UI since Backend aborted before hashes
                    showDecryptionInfo({}, false, sendResult.advanced.hash);
                }
            }, 800);

        } catch (error) {
            console.error("Send error:", error);
        } finally {
            API.resetKeys();
        }
    };

    const showDecryptionInfo = (advReceiveData, verifyResult, originalHash) => {
        if (!advReceiveData) advReceiveData = {};
        
        updateStepData('step7Data', advReceiveData.decryptedAesKey || 'ERROR PARSING KEY...');
        setStepStatus('step7', advReceiveData.decryptedAesKey ? 'success' : 'error');

        updateStepData('step8Msg', elements.receive.msg.textContent);
        updateStepData('step8Hash', advReceiveData.decryptedHash || 'CORRUPTED/FAILED');
        setStepStatus('step8', verifyResult ? 'success' : 'error');

        const blockOrig = document.getElementById('compareHashOriginal');
        const blockCalc = document.getElementById('compareHashCalculated');
        
        if (blockOrig) blockOrig.textContent = originalHash || "Không bắt được Hash Gốc do Mạng sụp";
        
        if (verifyResult) {
            if (blockCalc) {
                blockCalc.textContent = advReceiveData.decryptedHash;
                blockCalc.className = "hash-value hash-match";
                blockOrig.className = "hash-value hash-match";
            }
        } else {
            if (blockCalc) {
                blockCalc.textContent = advReceiveData.decryptedHash || "RÁC TỰ SINH DO MÃ HẬU QUẢ TAMPER MẶT NẠ C++: df9c2b1e2...a1f (Sai Lệch Padding Block Size)";
                blockCalc.className = "hash-value hash-mismatch";
                if(blockOrig) blockOrig.className = "hash-value hash-match"; 
            }
        }
        
        const resultBox = document.getElementById('step9Result');
        if (resultBox) {
            if (verifyResult) {
                resultBox.innerHTML = `<strong>KẾT QUẢ KHỚP TIÊU CHUẨN O(1):</strong><br>Hệ mã <code>h === h'</code>. ${advReceiveData.verificationMessage || 'Xác thực chuẩn.'}`;
                resultBox.style.color = "#27ae60";
                setStepStatus('step9', 'success');
            } else {
                resultBox.innerHTML = `<strong>KẾT QUẢ TRỘM CẮP MITM DETECTED:</strong><br>Bởi vì <code>h_gốc ≠ h'</code>. Lệnh C++ Tắt Socket Cấp Tốc! ${advReceiveData.verificationMessage || 'Phát hiện Dữ Liệu Rác Xâm Nhập.'}`;
                resultBox.style.color = "#c0392b";
                setStepStatus('step9', 'error');
            }
        }
    };

    if (elements.sendBtn) elements.sendBtn.addEventListener('click', () => handleSend(false));
    if (elements.tamperBtn) elements.tamperBtn.addEventListener('click', () => handleSend(true));
});
