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
            keys: ['incorporation', 'register company', 'pvt ltd', 'llp', 'opc', 'partnership', 'startup', 'proprietorship', 'incorporate', 'directors', 'din', 'dsc', 'private limited', 'one person company', 'sole proprietorship', 'business registration', 'register business', 'name approval', 'pan', 'tan', 'udyam', 'msme', 'moa', 'aoa', 'fssai'],
            response: `We offer seamless **Company Registration Services** for:<br>• Private Limited Companies, LLPs, Proprietorships, Partnerships, and One-Person Companies (OPC).<br>• DSC & DIN registrations, MCA name approvals, PAN/TAN, and ROC compliance setups.<br>⏱️ *Timeline*: Usually completed in 7-10 working days.<br>👉 Learn more on our <a href="services.html">Services page</a>.`
        },
        {
            keys: ['audit', 'compliance', 'bookkeeping', 'book-keeping', 'accounting', 'balance sheet', 'tally', 'p&l', 'statutory', 'ledger', 'profit', 'loss', 'financial statement', 'internal audit', 'tax audit', 'internal control', 'reconciliation', 'ledger maintenance', 'accounts'],
            response: `Keep your books accurate and up-to-date with our **Accounts & Bookkeeping Services**:<br>• Daily transaction recording & ledger maintenance.<br>• Preparation of Trial Balances, Balance Sheets, & P&L statements.<br>• Managing payables, receivables, invoice processing, and corporate MIS reporting.<br>👉 Check out our bookkeeping services on the <a href="services.html">Services page</a>.`
        },
        {
            keys: ['tax', 'income tax', 'itr', 'calculator', 'tax liability', 'computation', 'regime', 'standard deduction', 'depreciation', 'slab', 'direct tax', 'salary', 'salaried', 'corporate tax', 'capital gains', 'form 16', 'home loan', 'savings', 'itr1', 'itr2', 'itr3', 'itr4', 'advance tax', 'tax refund', 'deduction', '80c', '80d', '234f'],
            response: `We handle comprehensive **Income Tax Filing** u/s slabs for individuals and corporations:<br>• Individual ITR (salaried, consultants, & freelancers) and business corporate ITR.<br>• Advance tax planning & tax computation.<br>• Handling tax notices & representation u/s 234F assessments.<br>📊 *Calculator*: Estimate your liabilities u/s slabs using our interactive <a href="tax-calculator.html">Income Tax Calculator</a>.`
        },
        {
            keys: ['gst', 'indirect tax', 'gstr', 'cgst', 'sgst', 'hsn', 'filing', 'gstin', 'invoice', 'bill', 'threshold', 'gst certificate', 'certificate', 'gstr1', 'gstr3b', 'export', 'lut', 'refund', 'gst rate', 'gst slab', 'eway', 'waybill', 'composition', 'gstr-1', 'gstr-3b', 'gstr-9', 'gstr-9c', 'credit', 'itc', 'gstr-2a', 'gstr-2b'],
            response: `Avoid late fees and maximize Input Tax Credit with our **GST Services**:<br>• New GST registrations and GSTR-1 & GSTR-3B filings.<br>• Monthly/quarterly ITC reconciliation (GSTR-2A/2B).<br>• Annual returns (GSTR-9 & 9C) and GST notice handling.<br>👉 Find full GST details on our <a href="services.html">Services page</a>.`
        },
        {
            keys: ['tds', 'tds filing', 'quarterly tds', 'form 24q', 'form 26q', 'form 27q', '24q', '26q', '27q', 'tds challan', 'non-deduction', 'supplier tax credit', '16', '16a', 'form 16a'],
            response: `Ensure error-free compliance with our **TDS Calculation & Filing Services**:<br>• Quarterly returns (Form 24Q, 26Q, 27Q) for salaries and contracts.<br>• Challan reconciliation, PAN verifications, and Form 16/16A generations.<br>• Avoid interest penalties (1%-1.5%) and late filing fees (₹200/day).`
        },
        {
            keys: ['cma', 'cma projection', 'loan projection', 'project report', 'bank project', 'bank loan support', 'dscr', 'current ratio', 'repayment schedules', 'term loans', 'working capital loan'],
            response: `Get your bank loans approved confidently with our **CMA Projection & Project Reports**:<br>• Bank-compliant CMA data & TERM/Working Capital loan projections.<br>• Detailed mapping of DSCR, Quick Ratio, break-even analysis, and repayment models.<br>• Custom CMA formats trusted by NBFCs and national banks.`
        },
        {
            keys: ['financial analysis', 'planning', 'wealth creation', 'mis preparation', 'wealth planning', 'wealth advisor', 'capital growth', 'mis reports', 'p&l statement', 'statement prep'],
            response: `Secure your financial future with our **Financial Analysis & Strategic Planning**:<br>• Wealth creation & tax-saving investment advisory (u/s 80C, 80D, etc.).<br>• Custom tax savings mapping and monthly Management Information Systems (MIS) setups.<br>• Investor-ready deck preparation & audited financial statements.`
        },
        {
            keys: ['roc', 'roc compliance', 'annual compliance', 'mgt-7', 'aoc-4', 'dir-12', 'companies act', 'statutory register', 'resolutions', 'mca database', 'mca return', 'active status'],
            response: `Avoid director disqualifications (u/s 164) and MCA penalties with our **ROC Compliance Services**:<br>• Filing Annual Returns (Form MGT-7) & Financial Statements (Form AOC-4).<br>• Director appointment/resignation updates (DIR-12) & share transfers.<br>• Maintenance of statutory registers u/s Companies Act & meeting minutes.`
        },
        {
            keys: ['consulting', 'business consulting', 'scaling', 'cost optimization', 'startup advisor', 'tax strategist', 'scaling consulting', 'bottlenecks', 'exit strategies', 'transaction advisory'],
            response: `Drive sustainable growth with our **Business Consulting & Advisory**:<br>• Startup modeling, legal structuring, and cost optimization audits.<br>• Cash flow efficiency plans & transaction tax structuring.<br>• Scaling maps, bottleneck analysis, and exit strategies.<br>👉 Learn more on our <a href="services.html">Services page</a>.`
        },
        {
            keys: ['contact', 'phone', 'whatsapp', 'email', 'number', 'address', 'location', 'office', 'hour', 'find you', 'where', 'maps', 'navigation', 'mobile', 'telephone', 'email address', 'hours'],
            response: `Here are the official contact details for **Goodwill Consultancy Service**:<br>
            • 📞 **Phone/WhatsApp**: <a href="https://wa.me/919363476100" target="_blank">+91 93634 76100</a><br>
            • ✉️ **Email**: <a href="mailto:info@goodwillconsultancyservice.com">info@goodwillconsultancyservice.com</a><br>
            • 📍 **Location**: <a href="https://maps.app.goo.gl/djnj1EcMatT7d93n7" target="_blank">No.1, 1st Floor, Veerasamy St, Chennai 600003</a><br><br>
            You can also send us a message via the form at the bottom of the home page!`
        },
        {
            keys: ['security', 'safe', 'bot', 'password', 'otp', 'credential', 'hack', 'login', 'leak', 'secure', 'fraud', 'phishing', 'pin'],
            response: `🛡️ **Security Alert**: Goodwill Consultancy Service takes your privacy seriously.<br>
            • We will **NEVER** ask you for sensitive passwords, OTPs, or bank account credentials over chat.<br>
            • Never share your personal logins with anyone.<br>
            • For secure document transfer, always consult our verified representatives through our official WhatsApp at <a href="https://wa.me/919363476100" target="_blank">+91 93634 76100</a>.`
        }
    ];

    const fallbackResponse = `I'm sorry, I couldn't find a direct answer to your question on our website.`;

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
            // Parse markdown double asterisks to bold and single asterisks to italic (multiline safe)
            const formattedText = text
                .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
            msgDiv.innerHTML = formattedText;
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

    function containsVulnerabilityKeywords(query) {
        const vulKeys = ['vulnerability', 'exploit', 'hack', 'penetration', 'sql injection', 'xss', 'ddos', 'security bypass', 'backdoor', 'cve', 'malware', 'injection', 'phishing', 'payload'];
        return vulKeys.some(key => query.includes(key));
    }

    const contactTagline = `<br><br>📩 *Our Team will contact you, kindly fill <a href="index.html#contact">this form</a>.*`;

    function generateResponse(query) {
        const cleanQuery = query.toLowerCase().trim();
        if (!cleanQuery) return;

        isTyping = true;
        showTypingIndicator();

        // Simulate thinking delay (600ms - 1000ms) for organic premium feel
        setTimeout(() => {
            removeTypingIndicator();
            isTyping = false;

            // 1. Check for security/vulnerability questions locally to prevent exploitation explanations
            if (containsVulnerabilityKeywords(cleanQuery)) {
                appendMessage('bot', `I cannot assist with queries regarding website vulnerabilities, penetration testing, or security bypasses.` + contactTagline, true);
                return;
            }

            // 2. Local Website Search Matcher
            let foundResponse = null;
            for (const item of knowledgeBase) {
                const matches = item.keys.some(key => cleanQuery.includes(key));
                if (matches) {
                    foundResponse = item.response;
                    break;
                }
            }

            if (foundResponse) {
                appendMessage('bot', foundResponse + contactTagline, true);
            } else {
                appendMessage('bot', fallbackResponse + contactTagline, true);
            }
        }, 600 + Math.random() * 400);
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
                🔒 *Security Notice: We will never request sensitive bank account details, OTPs, or account credentials.*` + contactTagline, true);
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
