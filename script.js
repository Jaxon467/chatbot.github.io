class ChatBot {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.settings = {
            theme: 'light',
            responseSpeed: 'normal',
            soundEnabled: true,
            typingIndicator: true
        };
        
        this.responses = [
            "That's an interesting question! Let me think about that for a moment.",
            "I understand what you're asking. Here's my perspective on that topic.",
            "Great question! I'd be happy to help you with that.",
            "That's a thoughtful inquiry. Let me provide you with some insights.",
            "I appreciate you asking about that. Here's what I can tell you.",
            "That's something I can definitely help you with. Let me explain.",
            "Interesting point! I have some thoughts on that subject.",
            "I'm glad you brought that up. It's an important topic to discuss.",
            "That's a complex question, but I'll do my best to provide a helpful answer.",
            "I see what you're getting at. Let me share some relevant information.",
            "That's a valid concern. Here's how I would approach that situation.",
            "Good thinking! That's exactly the kind of question that leads to great discussions.",
            "I'm here to help! Let me break that down for you step by step.",
            "That's a fascinating topic. I'd love to explore that with you further.",
            "You've touched on something really important there. Here's my take on it."
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSettings();
        this.autoResizeTextarea();
    }
    
    bindEvents() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearBtn = document.getElementById('clearChat');
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsBtn = document.getElementById('closeSettings');
        const settingsModal = document.getElementById('settingsModal');
        
        // Send message events
        sendBtn.addEventListener('click', () => this.sendMessage());
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input events
        messageInput.addEventListener('input', () => {
            this.updateCharacterCount();
            this.toggleSendButton();
            this.autoResizeTextarea();
        });
        
        // Clear chat
        clearBtn.addEventListener('click', () => this.clearChat());
        
        // Settings modal
        settingsBtn.addEventListener('click', () => this.openSettings());
        closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                this.closeSettings();
            }
        });
        
        // Settings changes
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.updateSetting('theme', e.target.value);
        });
        
        document.getElementById('responseSpeed').addEventListener('change', (e) => {
            this.updateSetting('responseSpeed', e.target.value);
        });
        
        document.getElementById('soundEnabled').addEventListener('change', (e) => {
            this.updateSetting('soundEnabled', e.target.checked);
        });
        
        document.getElementById('typingIndicator').addEventListener('change', (e) => {
            this.updateSetting('typingIndicator', e.target.checked);
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSettings();
            }
        });
    }
    
    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        messageInput.value = '';
        this.updateCharacterCount();
        this.toggleSendButton();
        this.autoResizeTextarea();
        
        // Generate AI response
        this.generateResponse();
    }
    
    addMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const time = this.formatTime(new Date());
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <span>${avatar}</span>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p>${this.escapeHtml(content)}</p>
                </div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Store message
        this.messages.push({
            content,
            sender,
            timestamp: new Date()
        });
        
        // Play sound if enabled
        if (this.settings.soundEnabled && sender === 'ai') {
            this.playNotificationSound();
        }
    }
    
    generateResponse() {
        if (this.settings.typingIndicator) {
            this.showTypingIndicator();
        }
        
        this.isTyping = true;
        
        // Get response delay based on settings
        const delays = {
            fast: 1000 + Math.random() * 1000,
            normal: 2000 + Math.random() * 1000,
            slow: 3000 + Math.random() * 1000
        };
        
        const delay = delays[this.settings.responseSpeed];
        
        setTimeout(() => {
            this.hideTypingIndicator();
            
            // Generate a random response
            const response = this.responses[Math.floor(Math.random() * this.responses.length)];
            this.addMessage(response, 'ai');
            
            this.isTyping = false;
        }, delay);
    }
    
    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.classList.add('show');
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.classList.remove('show');
    }
    
    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <span>🤖</span>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>Hello! I'm your AI assistant. How can I help you today?</p>
                        </div>
                        <div class="message-time">Just now</div>
                    </div>
                </div>
            `;
            this.messages = [];
        }
    }
    
    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('show');
        
        // Update form values
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('responseSpeed').value = this.settings.responseSpeed;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('typingIndicator').checked = this.settings.typingIndicator;
    }
    
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        if (key === 'theme') {
            this.applyTheme(value);
        }
    }
    
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
            document.body.removeAttribute('data-theme');
        } else {
            // Auto theme based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.setAttribute('data-theme', 'dark');
            } else {
                document.body.removeAttribute('data-theme');
            }
        }
    }
    
    loadSettings() {
        const saved = localStorage.getItem('chatbot-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applyTheme(this.settings.theme);
    }
    
    saveSettings() {
        localStorage.setItem('chatbot-settings', JSON.stringify(this.settings));
    }
    
    updateCharacterCount() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.querySelector('.character-count');
        const count = messageInput.value.length;
        charCount.textContent = `${count}/1000`;
        
        if (count > 900) {
            charCount.style.color = 'var(--error-color)';
        } else if (count > 800) {
            charCount.style.color = 'var(--text-secondary)';
        } else {
            charCount.style.color = 'var(--text-secondary)';
        }
    }
    
    toggleSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const hasContent = messageInput.value.trim().length > 0;
        
        sendBtn.disabled = !hasContent || this.isTyping;
    }
    
    autoResizeTextarea() {
        const textarea = document.getElementById('messageInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
    
    formatTime(date) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    playNotificationSound() {
        // Create a simple notification sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});

// Handle system theme changes for auto theme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const chatbot = window.chatbot;
    if (chatbot && chatbot.settings.theme === 'auto') {
        chatbot.applyTheme('auto');
    }
});