import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PASSWORD
} from '../secrets.js';

const __dirname = path.resolve();

const sendEmail = async options => {
  // 1️⃣ Create a Transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD
    }
  });

  // 2️⃣ Read the HTML file
  const templatePath = path.join(
    __dirname,
    'src',
    'emails',
    'passwordReset.html'
  );
  let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  // 3️⃣ Replace variables
  htmlTemplate = htmlTemplate
    .replace(/{{user_email}}/g, options.email)
    .replace(/{{pass_reset_link}}/g, options.resetLink)
    .replace(/support_email/g, 'support@yourstore.com');

  // 4️⃣ Define email options
  const mailOptions = {
    from: 'store@demomailtrap.co',
    to: options.email,
    subject: options.subject,
    html: htmlTemplate
  };

  // 5️⃣ Send Mail
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
