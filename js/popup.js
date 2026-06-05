document.addEventListener('DOMContentLoaded', () => {
    const popupOverlay = document.getElementById('converter-popup');
    if (!popupOverlay) return;

    const popupContent = document.getElementById('popup-content');
    const closeBtn = document.getElementById('popup-close');

    // Storage Keys
    const COMPLETED_KEY = 'gw_questionnaire_completed';
    const SHOWN_COUNT_KEY = 'gw_popup_shown_count';
    const SESSION_SHOWN_KEY = 'gw_session_shown';

    // Logic
    const isCompleted = localStorage.getItem(COMPLETED_KEY) === 'true';
    let shownCount = parseInt(localStorage.getItem(SHOWN_COUNT_KEY) || '0', 10);
    const shownThisSession = sessionStorage.getItem(SESSION_SHOWN_KEY) === 'true';

    // State
    let currentStep = 1;
    let formData = {
        situation: '',
        services: [],
        issues: '',
        budget: '',
        timeline: '',
        contact: {}
    };

    if (!isCompleted && shownCount < 1 && !shownThisSession) {
        setTimeout(() => {
            showPopup();
            shownCount++;
            localStorage.setItem(SHOWN_COUNT_KEY, shownCount.toString());
            sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
        }, 2000);
    }

    closeBtn.addEventListener('click', closePopup);
    
    // Close on outside click
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });

    function showPopup() {
        renderStep();
        popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
    }

    function closePopup() {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function calculateScore() {
        let score = 50; // base score
        let urgency = 0;

        if (formData.issues.includes('notice')) {
            urgency += 30;
            score += 20;
        }
        if (formData.timeline.includes('Immediately')) {
            urgency += 20;
            score += 10;
        }
        if (formData.services.length > 0) {
            score += Math.min(formData.services.length * 10, 30);
        }
        if (formData.budget.includes('25,000') || formData.budget.includes('1,00,000')) {
            score += 20;
        }

        // Cap at 100
        score = Math.min(score, 100);

        let priorityLevel = 'Low priority / exploring';
        let badgeClass = 'badge-green';

        if (score >= 70 || urgency >= 30) {
            priorityLevel = 'High Priority';
            badgeClass = 'badge-red';
        } else if (score >= 40) {
            priorityLevel = 'Medium Priority';
            badgeClass = 'badge-amber';
        }

        return { score, priorityLevel, badgeClass };
    }

    function renderStep() {
        let html = '';
        
        // Progress bar
        html += `<div class="progress-bar mb-2"><div style="width: ${(currentStep/6)*100}%; background: var(--gold); height: 4px; border-radius: 2px;"></div></div>`;

        if (currentStep === 1) {
            html += `
                <h3 class="mb-1">What best describes your current situation?</h3>
                <div class="options-grid">
                    <button class="option-btn" data-value="Starting a new business">Starting a new business</button>
                    <button class="option-btn" data-value="Growing / existing business">Growing / existing business</button>
                    <button class="option-btn" data-value="Freelancer / individual professional">Freelancer / individual professional</button>
                    <button class="option-btn" data-value="Salaried employee">Salaried employee</button>
                </div>
            `;
        } else if (currentStep === 2) {
            html += `
                <h3 class="mb-1">Which services are you most urgently looking for? (Select all that apply)</h3>
                <div class="options-grid multi-select">
                    <button class="option-btn" data-value="Company / LLP registration">Company / LLP registration</button>
                    <button class="option-btn" data-value="GST registration & filing">GST registration & filing</button>
                    <button class="option-btn" data-value="Income tax / ITR filing">Income tax / ITR filing</button>
                    <button class="option-btn" data-value="Bookkeeping & accounts">Bookkeeping & accounts</button>
                    <button class="option-btn" data-value="Loan / banking support or CMA report">Loan / banking support or CMA report</button>
                    <button class="option-btn" data-value="Website / app development">Website / app development</button>
                </div>
                <button class="btn btn-primary mt-2" id="next-btn" disabled>Next &rarr;</button>
            `;
        } else if (currentStep === 3) {
            html += `
                <h3 class="mb-1">Are you currently facing any compliance issues or pending filings?</h3>
                <div class="options-grid">
                    <button class="option-btn" data-value="All up to date">All up to date</button>
                    <button class="option-btn" data-value="Minor delays / late filings">Minor delays / late filings</button>
                    <button class="option-btn" data-value="Received a tax / GST notice (urgent)">Received a tax / GST notice (urgent)</button>
                    <button class="option-btn" data-value="Not sure / need an audit">Not sure / need an audit</button>
                </div>
            `;
        } else if (currentStep === 4) {
            html += `
                <h3 class="mb-1">What is your approximate annual budget for professional services?</h3>
                <div class="options-grid">
                    <button class="option-btn" data-value="Under ₹5,000">Under ₹5,000</button>
                    <button class="option-btn" data-value="₹5,000 – ₹25,000">₹5,000 – ₹25,000</button>
                    <button class="option-btn" data-value="₹25,000 – ₹1,00,000">₹25,000 – ₹1,00,000</button>
                    <button class="option-btn" data-value="Above ₹1,00,000">Above ₹1,00,000</button>
                </div>
            `;
        } else if (currentStep === 5) {
            html += `
                <h3 class="mb-1">How soon do you need our support?</h3>
                <div class="options-grid">
                    <button class="option-btn" data-value="Immediately — within this week">Immediately — within this week</button>
                    <button class="option-btn" data-value="This month">This month</button>
                    <button class="option-btn" data-value="Within next 3 months">Within next 3 months</button>
                    <button class="option-btn" data-value="Just exploring for now">Just exploring for now</button>
                </div>
            `;
        } else if (currentStep === 6) {
            html += `
                <h3 class="mb-1">Where should we send your results?</h3>
                <form id="popup-contact-form">
                    <div class="form-group">
                        <input type="text" id="pc-name" placeholder="Full Name" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" id="pc-phone" placeholder="Mobile Number" required>
                    </div>
                    <div class="form-group">
                        <input type="email" id="pc-email" placeholder="Email Address" required>
                    </div>
                    <div class="form-group">
                        <input type="text" id="pc-biz" placeholder="Business Name (Optional)">
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Get my free consultation &rarr;</button>
                </form>
            `;
        } else if (currentStep === 7) {
            // Success Screen
            html += `
                <div class="text-center" style="padding: 20px 0;">
                    <i class="ph-fill ph-check-circle" style="font-size: 5rem; color: var(--gold); margin-bottom: 20px; display: inline-block;"></i>
                    <h3 class="mb-1" style="font-family: var(--font-heading); color: var(--navy); font-size: 2rem;">Thank You!</h3>
                    <p style="font-size: 1.1rem; color: var(--text-main); margin-bottom: 30px; font-weight: 500;">Our team will get back to you soon!</p>
                    <button class="btn btn-primary" onclick="document.getElementById('popup-close').click()" style="padding: 10px 30px;">Done</button>
                </div>
            `;
            
            localStorage.setItem(COMPLETED_KEY, 'true');
        }

        popupContent.innerHTML = html;
        attachListeners();
    }

    function attachListeners() {
        const btns = popupContent.querySelectorAll('.option-btn');
        
        if (currentStep === 2) {
            // Multi-select
            const nextBtn = document.getElementById('next-btn');
            btns.forEach(btn => {
                // Restore state if going back (not implemented here, but good practice)
                if(formData.services.includes(btn.dataset.value)) {
                    btn.classList.add('selected');
                }

                btn.addEventListener('click', () => {
                    btn.classList.toggle('selected');
                    const val = btn.dataset.value;
                    if (btn.classList.contains('selected')) {
                        if (!formData.services.includes(val)) formData.services.push(val);
                    } else {
                        formData.services = formData.services.filter(s => s !== val);
                    }
                    nextBtn.disabled = formData.services.length === 0;
                });
            });

            nextBtn.addEventListener('click', () => {
                currentStep++;
                renderStep();
            });

        } else if (currentStep === 6) {
            const form = document.getElementById('popup-contact-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const phone = document.getElementById('pc-phone').value;
                const email = document.getElementById('pc-email').value;

                // Validation Helpers
                function isGenericPhone(ph) {
                    const digits = ph.replace(/\D/g, '');
                    if (digits.length < 10) return true;
                    if (/^(\d)\1+$/.test(digits)) return true;
                    const commonSequentials = [
                        '1234567890', '0123456789', '9876543210', '0987654321',
                        '1111111111', '2222222222', '3333333333', '4444444444',
                        '5555555555', '6666666666', '7777777777', '8888888888',
                        '9999999999', '0000000000'
                    ];
                    return commonSequentials.includes(digits.substring(0, 10));
                }

                function isValidMail(em) {
                    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailReg.test(em)) return false;
                    const domain = em.split('@')[1].toLowerCase();
                    const blockedDomains = [
                        'tempmail.com', 'temp-mail.org', '10minutemail.com', 'yopmail.com',
                        'mailinator.com', 'dispostable.com', 'guerrillamail.com', 'sharklasers.com',
                        'getairmail.com', 'boun.cr', 'drdrb.net', 'mintemail.com', 'temp-mail.ru',
                        'throwawaymail.com', 'maildrop.cc', 'mailnesia.com', 'mailcatch.com',
                        'tempmailaddress.com', 'generator.email', 'tempmail.net', 'tempmail.co'
                    ];
                    if (blockedDomains.includes(domain)) return false;
                    return !(domain.includes('tempmail') || domain.includes('temp-mail') || domain.includes('disposable') || domain.includes('throwaway') || domain.includes('10minutemail') || domain.includes('mailinator') || domain.includes('yopmail'));
                }

                if (isGenericPhone(phone)) {
                    alert('❌ Please enter a valid phone number (not a generic or sequential number).');
                    return;
                }

                if (!isValidMail(email)) {
                    alert('❌ Please enter a valid email address (temporary emails are not accepted).');
                    return;
                }

                formData.contact = {
                    name: document.getElementById('pc-name').value,
                    phone: phone,
                    email: email,
                    biz: document.getElementById('pc-biz').value
                };
                currentStep++;
                renderStep();
            });
        } else if (currentStep < 6) {
            // Single select
            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.dataset.value;
                    if (currentStep === 1) {
                        formData.situation = val;
                        // Immediately mark as completed to prevent showing again, and close the popup
                        localStorage.setItem(COMPLETED_KEY, 'true');
                        closePopup();
                        return;
                    }
                    if (currentStep === 3) formData.issues = val;
                    if (currentStep === 4) formData.budget = val;
                    if (currentStep === 5) formData.timeline = val;
                    
                    currentStep++;
                    renderStep();
                });
            });
        }
    }
});
