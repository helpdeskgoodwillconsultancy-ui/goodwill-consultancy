/**
 * Goodwill Consultancy Service - AI Assistant Widget
 * Secure, client-side, interactive chat assistant.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Create and Inject Widget DOM Structure dynamically
    // First, find or create the unified floating socials container
    let socialsContainer = document.querySelector('.floating-socials');
    
    if (!socialsContainer) {
        const waFloat = document.querySelector('.whatsapp-float');
        if (waFloat) {
            // Create container and insert before the original float button
            socialsContainer = document.createElement('div');
            socialsContainer.className = 'floating-socials';
            waFloat.parentNode.insertBefore(socialsContainer, waFloat);
            
            // Restyle the standalone whatsapp float to match the list style
            waFloat.className = 'float-btn whatsapp';
            waFloat.style.position = 'static';
            waFloat.style.width = '45px';
            waFloat.style.height = '45px';
            waFloat.style.fontSize = '1.4rem';
            socialsContainer.appendChild(waFloat);
        } else {
            // Fallback if neither exists
            socialsContainer = document.createElement('div');
            socialsContainer.className = 'floating-socials';
            document.body.appendChild(socialsContainer);
        }
    }

    // Create the AI Trigger button
    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'float-btn ai-chat-trigger';
    triggerBtn.id = 'ai-chat-trigger';
    triggerBtn.setAttribute('aria-label', 'Open AI Assistant');
    triggerBtn.setAttribute('title', 'Open AI Assistant');
    triggerBtn.innerHTML = '<i class="ph-fill ph-chat-circle-dots"></i>';
    
    // Append triggerBtn as the last child inside the social stack (so it sits at the bottom)
    socialsContainer.appendChild(triggerBtn);

    // Create the Chat Window container
    const chatWindow = document.createElement('div');
    chatWindow.className = 'ai-chat-window';
    chatWindow.id = 'ai-chat-window';
    chatWindow.setAttribute('role', 'dialog');
    chatWindow.setAttribute('aria-label', 'Goodwill AI Assistant');
    chatWindow.innerHTML = `
        <div class="ai-chat-header">
            <div class="ai-chat-header-info">
                <div class="ai-chat-avatar"><img src="logo.png" alt="Goodwill Logo"></div>
                <div class="ai-chat-title-container">
                    <span class="ai-chat-title">Goodwill Assistant</span>
                    <span class="ai-chat-status">Online</span>
                </div>
            </div>
            <button class="ai-chat-close" id="ai-chat-close" aria-label="Close Chat">&times;</button>
        </div>
        <div class="ai-chat-messages" id="ai-chat-messages"></div>
        <div class="ai-chat-chips-container" id="ai-chat-chips"></div>
        <div class="ai-chat-input-bar">
            <input type="text" id="ai-chat-input" placeholder="Ask a question..." maxlength="200" autocomplete="off" aria-label="Chat input text">
            <button class="ai-chat-send-btn" id="ai-chat-send" aria-label="Send message">
                <i class="ph-fill ph-paper-plane-right"></i>
            </button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    const closeBtn = document.getElementById('ai-chat-close');
    const messagesContainer = document.getElementById('ai-chat-messages');
    const inputField = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const chipsContainer = document.getElementById('ai-chat-chips');

    let isTyping = false;

    // 2. Chat Knowledge Base & Dialogue Router
    const knowledgeBase = [
        {
            keys: ['gst', 'indirect tax', 'gstr', 'cgst', 'sgst', 'hsn'],
            response: `We provide complete **GST (Goods & Services Tax) Services**:<br>
            • New GST Registration & Amendments<br>
            • Monthly/Quarterly Return Filing (GSTR-1, GSTR-3B)<br>
            • Annual Returns (GSTR-9 & 9C Reconciliation)<br>
            • GST LUT for Exporters & Refund Claims.<br><br>
            Need to get registered or file your return? Contact us directly or use our <a href="services.html">Services page</a>.`
        },
        {
            keys: ['tax', 'income tax', 'itr', 'tds', 'calculator', 'tax liability', 'computation'],
            response: `We handle all **Direct Taxation & Income Tax** matters:<br>
            • Individual & Corporate ITR Filing<br>
            • TDS/TCS Return filing & Form 16 reconciliation<br>
            • Capital Gains calculations & Tax Saving advice.<br><br>
            👉 Check out our custom interactive <a href="tax-calculator.html">Income Tax Calculator</a> to estimate your tax liability under the New Regime!`
        },
        {
            keys: ['incorporation', 'register company', 'pvt ltd', 'llp', 'opc', 'partnership', 'startup', 'proprietorship'],
            response: `Want to register your business? We offer end-to-end **Company Incorporation & Startup Registrations**:<br>
            • Private Limited Company setup<br>
            • Limited Liability Partnership (LLP)<br>
            • One Person Company (OPC) & Sole Proprietorship<br>
            • MSME/Udyam & Partnership Registrations.<br><br>
            We take care of name approvals, DSC, Director DINs, PAN, and TAN applications.`
        },
        {
            keys: ['audit', 'compliance', 'bookkeeping', 'book-keeping', 'accounting', 'balance sheet', 'tally', 'p&l'],
            response: `Keep your business books clean and compliant. Our **Auditing & Bookkeeping Services** include:<br>
            • Comprehensive Bookkeeping (Tally/Cloud accounting)<br>
            • Preparation of Balance Sheets & Profit & Loss statements<br>
            • Statutory Audits, Tax Audits, & Internal audits.<br><br>
            Let us handle the numbers so you can focus on growing your business.`
        },
        {
            keys: ['contact', 'phone', 'whatsapp', 'email', 'number', 'address', 'location', 'office'],
            response: `Here are the official contact details for **Goodwill Consultancy Service**:<br>
            • 📞 **Phone/WhatsApp**: <a href="https://wa.me/919363476100" target="_blank">+91 93634 76100</a><br>
            • ✉️ **Email**: <a href="mailto:info@goodwillconsultancyservice.com">info@goodwillconsultancyservice.com</a><br>
            • 📍 **Location**: Tamil Nadu, India.<br><br>
            You can also send us a message via the form at the bottom of the home page!`
        },
        {
            keys: ['security', 'safe', 'bot', 'password', 'otp', 'credential', 'hack', 'login'],
            response: `🛡️ **Security Alert**: Goodwill Consultancy Service takes your privacy seriously.<br>
            • We will **NEVER** ask you for sensitive passwords, OTPs, or bank account credentials over chat.<br>
            • Never share your personal logins with anyone.<br>
            • For secure document transfer, always consult our verified representatives through our official WhatsApp at <a href="https://wa.me/919363476100" target="_blank">+91 93634 76100</a>.`
        }
    ];

    const fallbackResponse = `I am here to help you with Goodwill Consultancy Services!<br><br>
    Please ask me about **GST, Income Tax, Company Registration, Auditing, or Contact details**.<br><br>
    🔒 *Remember: We never ask for passwords or PINs.*`;

    const initialChips = ["GST Filing", "Tax Calculator", "Register Company", "Audits & Books", "Contact Info", "Security Help"];

    // 3. Helper Functions
    function sanitize(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    function appendMessage(sender, text, isHtml = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        
        if (isHtml) {
            msgDiv.innerHTML = text;
        } else {
            msgDiv.textContent = text;
        }
        
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'ai-typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('ai-typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function generateResponse(query) {
        const cleanQuery = query.toLowerCase().trim();
        if (!cleanQuery) return;

        isTyping = true;
        showTypingIndicator();

        // Simulate thinking delay (600ms - 1200ms) for organic premium feel
        setTimeout(() => {
            removeTypingIndicator();
            isTyping = false;

            let foundResponse = null;
            for (const item of knowledgeBase) {
                const matches = item.keys.some(key => cleanQuery.includes(key));
                if (matches) {
                    foundResponse = item.response;
                    break;
                }
            }

            if (foundResponse) {
                appendMessage('bot', foundResponse, true);
            } else {
                appendMessage('bot', fallbackResponse, true);
            }
        }, 800 + Math.random() * 400);
    }

    function handleSend() {
        if (isTyping) return;
        
        const text = inputField.value.trim();
        if (!text) return;

        // Secure character check and sanitization
        const cleanText = sanitize(text);
        
        appendMessage('user', cleanText);
        inputField.value = '';
        
        generateResponse(cleanText);
    }

    function renderChips(chips) {
        chipsContainer.innerHTML = '';
        chips.forEach(chipText => {
            const chipBtn = document.createElement('button');
            chipBtn.className = 'ai-chip';
            chipBtn.textContent = chipText;
            chipBtn.addEventListener('click', () => {
                if (isTyping) return;
                appendMessage('user', chipText);
                generateResponse(chipText);
            });
            chipsContainer.appendChild(chipBtn);
        });
    }

    // 4. Event Listeners
    triggerBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            // Check if messages are empty to append welcome message
            if (messagesContainer.children.length === 0) {
                appendMessage('bot', `Hello! Welcome to **Goodwill Consultancy Service**. 👋<br><br>
                How can I assist you today with taxation, corporate filings, or financial advisory?<br><br>
                🔒 *Security Notice: We will never request sensitive bank account details, OTPs, or account credentials.*`, true);
                renderChips(initialChips);
            }
            inputField.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    sendBtn.addEventListener('click', handleSend);

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });

    // Close chat when clicking outside the chat window
    document.addEventListener('click', (e) => {
        if (!chatWindow.contains(e.target) && !triggerBtn.contains(e.target) && chatWindow.classList.contains('active')) {
            chatWindow.classList.remove('active');
        }
    });
});
