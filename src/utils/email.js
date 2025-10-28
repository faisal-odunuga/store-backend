import nodemailer from 'nodemailer';
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PASSWORD
} from '../secrets.js';

const sendEmail = async options => {
  // Create a Transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // use TLS
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD
    }
  });

  // Define the email options
  const mailOptions = {
    from: 'Store <admin@store.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: options.html
  };

  // Send Mail
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
