# Abencivo Biotech V3 — Complete Full-Stack Website

**Design theme: Premium Red & White pharmaceutical UI.**

A single integrated starter project containing:
- Premium responsive React/Vite website
- Node.js/Express backend
- SQLite database
- Secure admin login with JWT + bcrypt
- Product CMS
- Enquiry CRM/status tracking
- Audit logs
- Email notification support via SMTP
- WhatsApp buttons
- Image/PDF upload API
- SEO-ready structure
- Easy company configuration

## 1. Install
Requirements: Node.js 20+ recommended.

```bash
npm install
copy .env.example .env
```

On macOS/Linux:
```bash
cp .env.example .env
```

Edit `.env`. At minimum set:
- JWT_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD

## 2. Start
```bash
npm run seed
npm run dev
```

Website: http://localhost:5173
API: http://localhost:4000

Production frontend build:
```bash
npm run build
npm start
```

## 3. Add your real company details
Edit ONLY:
`src/config.js`

Put your:
- phone
- WhatsApp number
- email
- address
- website
- logo
- brochure
- social links

The main frontend reads these values automatically.

## 4. Add real images
Put your logo/product images in:
`public/images/`

For products, you can use the Admin dashboard's image URL field after adding uploaded images.

The included product images are placeholders only. Do not publish demo product claims as real company products.

## 5. Admin
Open:
`http://localhost:5173/#admin`

Use the email/password configured in `.env`.

The admin currently supports:
- Dashboard
- Product creation
- Product deletion
- Enquiry status updates
- Audit logs

The backend also exposes product update and file upload endpoints for future richer CMS screens.

## 6. Email
To make enquiry notifications actually email you, fill these `.env` values:
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_TO=
MAIL_FROM=

If SMTP is blank, enquiries still save to SQLite; only email notification is skipped.

## 7. Database
SQLite file:
`data/abencivo.sqlite`

Do not commit or publicly expose the database.

## 8. Before production
- Replace every placeholder company detail.
- Add only verified product/company information.
- Use HTTPS.
- Use a long random JWT secret.
- Use a strong unique admin password.
- Restrict CORS to your production domain.
- Add rate limiting/WAF and backups.
- Configure secure file storage for large deployments.
- Review privacy/consent requirements for enquiry and resume data.
- Set proper domain, email and analytics accounts.

## 9. Suggested next upgrade
For a larger deployment, move SQLite to PostgreSQL and object storage, add full blog/career/download CMS editors, role-based admin permissions, CSV export, dashboard charts, password reset, 2FA and automated backups.
