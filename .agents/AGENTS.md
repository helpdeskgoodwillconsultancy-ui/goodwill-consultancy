# Goodwill Consultancy Service Workspace Rules

## Security Guidelines

### 1. Secure Backend Contact Form Proxy (DO NOT REMOVE)
- **Rule**: Never expose the Google Apps Script URL (`https://script.google.com/macros/s/.../exec`) directly in any frontend JavaScript file (like `js/script.js`).
- **Implementation**: The contact form MUST submit to the local backend proxy `/api/contact`. The Node.js server (`server.js`) is responsible for sanitizing, validating, rate-limiting, and forwarding form submissions to the Google Sheet backend in the background.
- **Why**: This prevents OSINT harvesting of the Google Script URL and protects the system from database spam and script injection attacks.
