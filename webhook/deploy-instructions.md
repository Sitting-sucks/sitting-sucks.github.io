# Stripe Webhook — Deploy Instructions

When someone buys The Complete Claude Guide ($29), this server catches the payment and emails them the PDF automatically.

---

## STEP 1 — Gmail App Password

You need an App Password (not your regular Gmail password).

1. Go to myaccount.google.com
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google" click **2-Step Verification** (must be enabled)
4. Scroll to the bottom → click **App passwords**
5. Select app: **Mail** → Select device: **Other** → type "RyanAISetup" → click **Generate**
6. Copy the 16-character password shown (e.g. `abcd efgh ijkl mnop`)
7. Save it — you'll need it in Step 3

---

## STEP 2 — Get Stripe Keys

**Secret Key:**
1. Go to dashboard.stripe.com → Developers → API keys
2. Copy your **Secret key** (starts with `sk_live_...`)

**Webhook Secret** (do this AFTER deploying to Railway in Step 4):
1. dashboard.stripe.com → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://YOUR-RAILWAY-URL.railway.app/webhook`
3. Events to listen for: `checkout.session.completed`
4. Click Add endpoint → copy the **Signing secret** (starts with `whsec_...`)

---

## STEP 3 — Deploy to Railway (Free)

1. Go to railway.app → Sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `Sitting-sucks/sitting-sucks.github.io`
4. Set **Root Directory** to `webhook`
5. Click **Deploy**
6. Once deployed, go to **Variables** tab and add these one by one:

```
STRIPE_SECRET_KEY    = sk_live_your_key_here
STRIPE_WEBHOOK_SECRET = whsec_your_secret_here  (from Step 2)
GMAIL_USER           = ryansaisetup@gmail.com
GMAIL_APP_PASSWORD   = your-16-char-app-password (from Step 1)
PDF_PATH             = /home/ryan/The-Complete-Claude-Guide-v2.pdf
```

**Note on PDF_PATH:** Railway runs in the cloud so it can't access your local file.
You need to either:
- Upload the PDF to the webhook folder and commit it to GitHub (easiest)
- Or use a file hosting service (Google Drive direct link)

**Easiest option:** Copy the PDF into the webhook folder:
```bash
cp ~/The-Complete-Claude-Guide-v2.pdf ~/ryansaisetup/webhook/guide.pdf
```
Then change PDF_PATH to: `/app/guide.pdf`

7. Go back to your Railway deployment → copy the URL (e.g. `https://abc123.railway.app`)

---

## STEP 4 — Add Webhook to Stripe

1. dashboard.stripe.com → Developers → Webhooks → **Add endpoint**
2. URL: `https://YOUR-RAILWAY-URL.railway.app/webhook`
3. Events: select `checkout.session.completed`
4. Save → copy the Signing secret → add to Railway Variables as `STRIPE_WEBHOOK_SECRET`

---

## STEP 5 — Test It

In your Ubuntu terminal:
```bash
cd ~/ryansaisetup/webhook
npm install
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/webhook
# In another terminal:
node server.js
# Trigger a test payment:
stripe trigger checkout.session.completed
```

Check the terminal — you should see "Payment confirmed" and "Guide sent to..."

---

## How it works

1. Customer clicks Buy on ryansaisetup.com
2. They pay $29 on Stripe
3. Stripe sends a signal to your Railway server
4. Server verifies it's a real Stripe payment
5. Server emails the PDF to the customer automatically
6. Customer gets the email within seconds

If anything fails, the server logs the customer email so you can send manually.
