require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();

// Raw body needed for Stripe signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Webhook signature failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.payment_status === 'paid') {
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name?.split(' ')[0] || 'there';
      const amountPaid = (session.amount_total / 100).toFixed(2);

      console.log(`[${new Date().toISOString()}] Payment confirmed — ${customerEmail} paid $${amountPaid}`);

      // Only send guide for the $29 product
      // Amount is 2900 cents = $29.00
      if (session.amount_total === 2900) {
        try {
          await sendGuideEmail(customerEmail, customerName);
          console.log(`[${new Date().toISOString()}] Guide sent to ${customerEmail}`);
        } catch (err) {
          console.error(`[${new Date().toISOString()}] EMAIL FAILED for ${customerEmail} — send manually!`);
          console.error(err.message);
        }
      } else {
        // For other products ($399 setup, etc) — just log for now
        console.log(`[${new Date().toISOString()}] Other product purchased — $${amountPaid} from ${customerEmail}`);
      }
    }
  }

  res.json({ received: true });
});

// Health check
app.get('/', (req, res) => res.json({ status: 'Ryan AI Setup webhook running' }));

async function sendGuideEmail(toEmail, firstName) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const pdfPath = process.env.PDF_PATH;
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF not found at ${pdfPath}`);
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,-apple-system,sans-serif;">
    <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1e1b4b,#312e81,#4F46E5);padding:40px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">📘</div>
        <h1 style="color:white;font-size:24px;font-weight:800;margin:0 0 8px;">Your guide is here, ${firstName}!</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;">The Complete Claude Guide is attached to this email.</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <p style="font-size:16px;color:#111827;margin:0 0 20px;">Hey ${firstName},</p>
        <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 24px;">
          Thank you so much for grabbing <strong>The Complete Claude Guide</strong>! I put everything I know about getting real results from Claude into this — no fluff, no tech talk.
        </p>

        <div style="background:#f8f7ff;border-left:4px solid #4F46E5;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
          <p style="font-size:14px;font-weight:700;color:#4F46E5;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">What's inside:</p>
          <ul style="margin:0;padding:0 0 0 20px;color:#374151;font-size:14px;line-height:2;">
            <li>How to use Claude Chat, Cowork, and Claude Code — and when to use each</li>
            <li>Every slash command explained with real examples</li>
            <li>Connecting your tools (email, calendar, Notion, and more)</li>
            <li>Deploying background agents that work while you sleep</li>
            <li>Tips and shortcuts that save hours every week</li>
          </ul>
        </div>

        <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 28px;">
          If you have any questions or want help setting things up, just reply to this email — I read every one.
        </p>

        <div style="text-align:center;margin:0 0 28px;">
          <a href="https://ryansaisetup.com" style="display:inline-block;background:#F59E0B;color:#111827;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
            Visit ryansaisetup.com
          </a>
        </div>

        <p style="font-size:14px;color:#6b7280;margin:0;">
          Talk soon,<br>
          <strong style="color:#111827;">Ryan</strong><br>
          Ryan's AI Setup<br>
          <a href="https://ryansaisetup.com" style="color:#4F46E5;">ryansaisetup.com</a> · (929) 501-5423
        </p>
      </div>

    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"Ryan's AI Setup" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your Complete Claude Guide is here! 🎉",
    html,
    attachments: [{
      filename: 'The-Complete-Claude-Guide.pdf',
      path: pdfPath,
    }],
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[${new Date().toISOString()}] Webhook server running on port ${PORT}`));
