const nodemailer = require('nodemailer');
require('dotenv').config();

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[email skipped] ${subject}`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Thika House Hunter <no-reply@localhost>',
    to,
    subject,
    text,
    html,
  });
}

async function sendContactNotification(message) {
  const recipient = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
  if (!recipient) return { skipped: true };

  return sendMail({
    to: recipient,
    subject: `New Thika House Hunter message: ${message.subject || 'General inquiry'}`,
    text: `${message.name} <${message.email}> wrote:\n\n${message.message}`,
  });
}

module.exports = {
  sendContactNotification,
  sendMail,
};
