// JS for handling Authentication, Document Uploads, and Contact Form

document.addEventListener('DOMContentLoaded', () => {
    checkSession();

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const status = document.getElementById('contact-message-status');
            
            const data = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value,
                service: document.getElementById('contact-service').value,
                message: document.getElementById('contact-message').value
            };

            try {
                btn.disabled = true;
                btn.textContent = 'Sending...';
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                
                if (res.ok) {
                    status.style.color = 'green';
                    status.textContent = 'Thank you! Your message has been sent.';
                    contactForm.reset();
                } else {
                    status.style.color = 'red';
                    status.textContent = result.error || 'Failed to send message.';
                }
            } catch (err) {
                status.style.color = 'red';
                status.textContent = 'Server error. Please try again later.';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Send Message →';
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button');
            const status = document.getElementById('login-error');
            
            try {
                btn.disabled = true;
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('login-email').value,
                        password: document.getElementById('login-password').value
                    })
                });
                const result = await res.json();
                
                if (res.ok && result.authenticated) {
                    checkSession(); // refresh view
                    loginForm.reset();
                    status.textContent = '';
                } else {
                    status.textContent = result.error || 'Login failed.';
                }
            } catch (err) {
                status.textContent = 'Server error.';
            } finally {
                btn.disabled = false;
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('register-form');
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button');
            const status = document.getElementById('reg-error');
            
            try {
                btn.disabled = true;
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('reg-email').value,
                        password: document.getElementById('reg-password').value
                    })
                });
                const result = await res.json();
                
                if (res.ok && result.authenticated) {
                    checkSession(); // refresh view
                    registerForm.reset();
                    status.textContent = '';
                } else {
                    status.textContent = result.error || 'Registration failed.';
                }
            } catch (err) {
                status.textContent = 'Server error.';
            } finally {
                btn.disabled = false;
            }
        });
    }

    // Upload Form
    const uploadForm = document.getElementById('upload-form');
    if(uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = uploadForm.querySelector('button');
            const status = document.getElementById('upload-message');
            const fileInput = document.getElementById('document-file');
            
            if(!fileInput.files[0]) return;

            const formData = new FormData();
            formData.append('document', fileInput.files[0]);

            try {
                btn.disabled = true;
                btn.textContent = 'Uploading...';
                status.style.color = 'black';
                status.textContent = 'Uploading, please wait...';

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();
                
                if (res.ok) {
                    status.style.color = 'green';
                    status.textContent = 'Document uploaded successfully!';
                    uploadForm.reset();
                    fetchDocuments(); // refresh list
                } else {
                    status.style.color = 'red';
                    status.textContent = result.error || 'Upload failed.';
                }
            } catch (err) {
                status.style.color = 'red';
                status.textContent = 'Server error. File may be too large or invalid.';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Upload Document';
            }
        });
    }
});

function toggleAuthView(view) {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('register-view').classList.add('hidden');
    if (view === 'login') {
        document.getElementById('login-view').classList.remove('hidden');
    } else {
        document.getElementById('register-view').classList.remove('hidden');
    }
}

async function checkSession() {
    try {
        const res = await fetch('/api/session');
        const result = await res.json();
        
        const loginView = document.getElementById('login-view');
        const regView = document.getElementById('register-view');
        const portalView = document.getElementById('portal-view');
        const navLogout = document.getElementById('nav-logout');
        
        if (result.authenticated) {
            loginView.classList.add('hidden');
            regView.classList.add('hidden');
            portalView.classList.remove('hidden');
            navLogout.classList.remove('hidden');
            document.getElementById('user-email-display').textContent = result.email;
            fetchDocuments();
        } else {
            loginView.classList.remove('hidden');
            regView.classList.add('hidden');
            portalView.classList.add('hidden');
            navLogout.classList.add('hidden');
        }
    } catch (err) {
        console.error('Failed to check session');
    }
}

async function logoutUser() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        checkSession();
    } catch(err) {
        console.error('Logout failed');
    }
}

async function fetchDocuments() {
    try {
        const res = await fetch('/api/documents');
        const result = await res.json();
        const list = document.getElementById('doc-list');
        
        if (res.ok && result.documents) {
            list.innerHTML = '';
            if (result.documents.length === 0) {
                list.innerHTML = '<li>No documents uploaded yet.</li>';
                return;
            }
            
            result.documents.forEach(doc => {
                const li = document.createElement('li');
                const date = new Date(doc.upload_date).toLocaleDateString();
                li.innerHTML = `
                    <div>
                        <strong>${doc.original_name}</strong>
                        <div style="font-size: 0.8rem; color: #666;">Uploaded on ${date}</div>
                    </div>
                `;
                list.appendChild(li);
            });
        }
    } catch (err) {
        console.error('Failed to fetch documents');
    }
}
