const nodemailer = require('nodemailer');

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, html, text }) {
  if (!isEmailConfigured()) {
    return { skipped: true };
  }

  const transport = createTransport();
  return transport.sendMail({
    from: process.env.EMAIL_FROM || 'Connect254 <hello@connect254.local>',
    to,
    subject,
    html,
    text,
  });
}

module.exports = {
  isEmailConfigured,
  sendEmail,
};
