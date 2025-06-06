// utils/sendMail.js
import nodemailer from 'nodemailer';
import { config } from '../config/keys.js';

const sendSupportMail = async ({ name, email, message }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.supportEmail,
      pass: config.supportEmailPass,
    },
  });

  await transporter.sendMail({
    from: config.supportEmail,
    to: config.supportEmail,
    subject: `New Query from ${name}`,
    html: `
      <h3>Sender: ${name}</h3>
      <p>Email: ${email}</p>
      <p>Message: ${message}</p>
    `,
  });
};
export default sendSupportMail;
