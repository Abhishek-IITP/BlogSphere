const nodemailer = require('nodemailer');
require('dotenv').config();

const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const secureEnv = process.env.EMAIL_SECURE;
const secure = secureEnv ? secureEnv === 'true' : port === 465;

// Lazy-initialized real transporter. We export a small wrapper that ensures
// the real transporter is created (and an Ethereal test account is created
// if needed) before sending mail. This keeps existing `transporter.sendMail`
// usage working without changing call-sites.
let realTransporter = null;

async function initTransporter() {
  if (realTransporter) return realTransporter;

  // If a host is provided, try to use it. If the host is Ethereal and
  // credentials are missing or look like placeholders, create a test
  // account automatically.
  if (host) {
    // Auto-create Ethereal account when host mentions ethereal and no valid auth
    const usingEtherealHost = String(host).toLowerCase().includes('ethereal.email');
    const hasAuth = user && pass;

    if (usingEtherealHost && !hasAuth) {
      // createTestAccount returns credentials we can use to send and preview
      // emails without manual setup.
      const testAccount = await nodemailer.createTestAccount();
      realTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Using Ethereal test account for email (created at runtime):', testAccount.user);
    } else {
      // Use the configured SMTP server
      realTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: hasAuth ? { user, pass } : undefined,
        tls: {
          rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
        },
      });
    }
  } else {
    // No SMTP host configured. Use jsonTransport so mails won't attempt network
    // delivery and will be represented as JSON objects (useful for dev).
    realTransporter = nodemailer.createTransport({ jsonTransport: true });
    console.log('No EMAIL_HOST configured — using jsonTransport for development.');
  }

  return realTransporter;
}

// Export a small wrapper compatible with existing code that calls
// `transporter.sendMail(...)`.
module.exports = {
  sendMail: async (mailOptions) => {
    const t = await initTransporter();
    return t.sendMail(mailOptions);
  },
  verify: async () => {
    const t = await initTransporter();
    return t.verify();
  },
};