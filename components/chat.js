/**
 * Chat Component
 * AI Chat modal with message bubbles and file upload
 * Integrates with Gemini + Fal.ai via backend proxy
 */

const BACKEND_URL = 'https://aishift_bc.azizakal.org';

let currentItem = null;
let chatModal = null;
let messagesContainer = null;
let chatInput = null;
let pendingFile = null; // Store uploaded file until send

export function initChat() {
    chatModal = document.getElementById('chatModalOverlay');
    messagesContainer = document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput');

    const closeBtn = document.getElementById('closeChatBtn');
    const sendBtn = document.getElementById('sendBtn');
    const attachImageBtn = document.getElementById('attachImageBtn');
    const attachVideoBtn = document.getElementById('attachVideoBtn');
    const attachFileBtn = document.getElementById('attachFileBtn');
    const imageInput = document.getElementById('imageInput');
    const videoInput = document.getElementById('videoInput');
    const fileInput = document.getElementById('fileInput');

    // Close modal
    closeBtn?.addEventListener('click', closeChat);
    chatModal?.addEventListener('click', (e) => {
        if (e.target === chatModal) closeChat();
    });

    // Send message
    sendBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Attach buttons
    attachImageBtn?.addEventListener('click', () => {
        if (currentItem?.chatBot?.binary?.find(b => b.type === 'image')?.enabled) {
            imageInput?.click();
        }
    });

    attachVideoBtn?.addEventListener('click', () => {
        if (currentItem?.chatBot?.binary?.find(b => b.type === 'video')?.enabled) {
            videoInput?.click();
        }
    });

    attachFileBtn?.addEventListener('click', () => {
        if (currentItem?.chatBot?.binary?.find(b => b.type === 'file')?.enabled) {
            fileInput?.click();
        }
    });

    // File inputs - show thumbnail only, don't auto-send
    imageInput?.addEventListener('change', handleFileSelect);
    videoInput?.addEventListener('change', handleFileSelect);
    fileInput?.addEventListener('change', handleFileSelect);

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeChat();
    });
}

export function openChat(item) {
    currentItem = item;
    pendingFile = null; // Reset pending file

    if (!chatModal || !messagesContainer) return;

    // Clear previous messages
    messagesContainer.innerHTML = '';

    // Clear file preview if exists
    clearFilePreview();

    // Update modal title with item head
    const titleSpan = chatModal.querySelector('.chat-title span');
    if (titleSpan) {
        titleSpan.textContent = item.head || 'AI Assistant';
    }

    // Update attachment buttons based on item config
    updateAttachmentButtons(item);

    // Show modal
    chatModal.classList.add('active');
    chatInput?.focus();
}

export function closeChat() {
    chatModal?.classList.remove('active');
    currentItem = null;
    pendingFile = null;
    clearFilePreview();
}

function updateAttachmentButtons(item) {
    const imageBtn = document.getElementById('attachImageBtn');
    const videoBtn = document.getElementById('attachVideoBtn');
    const fileBtn = document.getElementById('attachFileBtn');
    const chatInputEl = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    const binary = item?.chatBot?.binary || [];

    // Update opacity based on enabled state
    const imageEnabled = binary.find(b => b.type === 'image')?.enabled ?? true;
    const videoEnabled = binary.find(b => b.type === 'video')?.enabled ?? true;
    const fileEnabled = binary.find(b => b.type === 'file')?.enabled ?? true;
    const textareaEnabled = binary.find(b => b.type === 'textarea')?.enabled ?? true;

    if (imageBtn) {
        imageBtn.style.opacity = imageEnabled ? '1' : '0.3';
        imageBtn.disabled = !imageEnabled;
    }
    if (videoBtn) {
        videoBtn.style.opacity = videoEnabled ? '1' : '0.3';
        videoBtn.disabled = !videoEnabled;
    }
    if (fileBtn) {
        fileBtn.style.opacity = fileEnabled ? '1' : '0.3';
        fileBtn.disabled = !fileEnabled;
    }

    // Enable/disable textarea based on binary config
    if (chatInputEl) {
        chatInputEl.disabled = !textareaEnabled;
        chatInputEl.style.opacity = textareaEnabled ? '1' : '0.5';
        chatInputEl.placeholder = textareaEnabled ? 'Mesajınızı yazın...' : 'Metin girişi devre dışı';
    }
}

/**
 * Handle file selection - show thumbnail only, don't send yet
 */
function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    pendingFile = file;
    showFilePreview(file);

    // Reset input for re-selection
    e.target.value = '';
}

/**
 * Show file preview/thumbnail in chat input area
 */
function showFilePreview(file) {
    clearFilePreview();

    const previewContainer = document.createElement('div');
    previewContainer.id = 'file-preview';
    previewContainer.className = 'file-preview';

    if (file.type.startsWith('image/')) {
        // Image thumbnail
        const img = document.createElement('img');
        img.className = 'file-thumbnail';
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        previewContainer.appendChild(img);
    } else if (file.type.startsWith('video/')) {
        // Video thumbnail
        const video = document.createElement('video');
        video.className = 'file-thumbnail';
        video.muted = true;
        const reader = new FileReader();
        reader.onload = (e) => {
            video.src = e.target.result;
            video.currentTime = 0.5;
        };
        reader.readAsDataURL(file);
        previewContainer.appendChild(video);
    } else {
        // File icon
        const icon = document.createElement('div');
        icon.className = 'file-icon';
        icon.textContent = '📎';
        previewContainer.appendChild(icon);
    }

    // File name
    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
    previewContainer.appendChild(fileName);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => {
        pendingFile = null;
        clearFilePreview();
    };
    previewContainer.appendChild(removeBtn);

    // Insert preview before input area
    const inputArea = document.querySelector('.chat-input-area');
    inputArea?.insertBefore(previewContainer, inputArea.firstChild);
}

/**
 * Clear file preview
 */
function clearFilePreview() {
    document.getElementById('file-preview')?.remove();
}

/**
 * Send message to backend API
 */
async function sendMessage() {
    const message = chatInput?.value?.trim();

    // Need either a message or a file to send
    if (!message && !pendingFile) return;

    // Add user message to chat
    if (message) {
        addMessage('user', message);
    }
    if (pendingFile) {
        addFileMessage('user', pendingFile);
    }

    chatInput.value = '';
    const fileToSend = pendingFile;
    pendingFile = null;
    clearFilePreview();

    // Show typing indicator
    showTypingIndicator();

    try {
        // Get item prompt and model
        const itemPrompt = currentItem?.chatBot?.prompt || '';
        const falModel = currentItem?.chatBot?.model || 'fal-ai/flux/dev/image-to-image';

        // Call backend API
        const formData = new FormData();
        formData.append('userMessage', message || 'Generate based on the image');
        formData.append('itemPrompt', itemPrompt);
        formData.append('falModel', falModel);
        if (fileToSend) {
            formData.append('image', fileToSend);
        }

        const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        hideTypingIndicator();

        if (data.error) {
            addMessage('bot', `❌ Hata: ${data.error}`);
            return;
        }

        // Show generated image
        if (data.imageUrl) {
            addImageMessage('bot', data.imageUrl);
        } else {
            addMessage('bot', 'Görsel oluşturulamadı. Lütfen tekrar deneyin.');
        }

    } catch (error) {
        hideTypingIndicator();
        console.error('API Error:', error);
        addMessage('bot', `❌ Bağlantı hatası: ${error.message}`);
    }
}

function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = content;
    messagesContainer?.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addFileMessage(type, file) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type} file-message`;

    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.className = 'message-image';
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        messageDiv.appendChild(img);
    } else {
        const icon = file.type.startsWith('video/') ? '🎬' : '📎';
        messageDiv.textContent = `${icon} ${file.name}`;
    }

    messagesContainer?.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addImageMessage(type, imageUrl) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type} image-message`;

    // Create a loading placeholder
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'image-loading';
    loadingDiv.innerHTML = `
        <div style="width: 200px; height: 200px; background: var(--bg-tertiary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
            <span>Yükleniyor...</span>
        </div>
    `;
    messageDiv.appendChild(loadingDiv);

    const img = document.createElement('img');
    img.className = 'generated-image';
    img.crossOrigin = 'anonymous'; // Handle CORS
    img.style.display = 'none'; // Hide until loaded

    img.onload = () => {
        loadingDiv.remove();
        img.style.display = 'block';
    };

    img.onerror = () => {
        loadingDiv.innerHTML = `
            <div style="width: 200px; padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-md); text-align: center;">
                <p style="color: var(--text-muted); margin-bottom: 8px;">Görsel yüklenemedi</p>
                <a href="${imageUrl}" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Görseli aç</a>
            </div>
        `;
    };

    img.src = imageUrl;
    img.alt = 'Generated Image';
    img.onclick = () => window.open(imageUrl, '_blank');

    messageDiv.appendChild(img);
    messagesContainer?.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;
    messagesContainer?.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    document.getElementById('typing-indicator')?.remove();
}
