function formatTimestamp() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function truncateString(str, maxLength) {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

function copyToClipboard(text) {
    if (!navigator.clipboard) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Đã copy vào clipboard!', 'success');
        } catch (err) {
            showToast('Không thể copy', 'error');
        }
        document.body.removeChild(textArea);
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Đã copy vào clipboard!', 'success');
    }).catch(err => {
        showToast('Không thể copy', 'error');
        console.error('Could not copy text: ', err);
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.color = 'white';
    toast.style.background = type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#34495e';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    return spinner;
}

function animateElement(element, animationClass) {
    if (!element) return;
    element.classList.add(animationClass);
    element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
    }, { once: true });
}

function validateInput(text) {
    if (!text || text.trim() === '') return false;
    if (text.length > 5000) return false;
    return true;
}

function escapeHtml(unsafe) {
    return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

const UIHelpers = {
    formatTimestamp,
    truncateString,
    copyToClipboard,
    showToast,
    createLoadingSpinner,
    animateElement,
    validateInput,
    escapeHtml,
    generateId
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIHelpers;
} else {
    window.UIHelpers = UIHelpers;
}
