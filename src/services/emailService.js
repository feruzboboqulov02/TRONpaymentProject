import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPaymentNotification(orderId, address, amount) {
  const mailOptions = {
    from: `"TRON Payment" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL, 
    subject: `Payment Received for Order ${orderId}`,
    html: `
      <h3>Payment Received</h3>
      <p>Order ID: <b>${orderId}</b></p>
      <p>Wallet Address: <b>${address}</b></p>
      <p>Amount Received: <b>${amount} USDT</b></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent for order ${orderId}`);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
}
