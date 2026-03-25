# ryansaisetup.github.io

Ryan's AI Setup — AI consulting and installation business website.

## Quick Deploy to GitHub Pages

1. Create a new repository on GitHub named `ryansaisetup.github.io`
2. Clone it locally:
   ```
   git clone https://github.com/sitting-sucks/ryansaisetup.github.io.git
   ```
3. Copy `index.html` into the repo folder
4. Push to GitHub:
   ```
   cd ryansaisetup.github.io
   git add .
   git commit -m "Initial site launch"
   git push origin main
   ```
5. Go to **Settings > Pages** in your GitHub repo
6. Under "Source", select `main` branch and `/ (root)` folder
7. Your site will be live at: **https://ryansaisetup.github.io**

## Before You Go Live — Checklist

- [ ] Create a [Cal.com](https://cal.com) account with ryansaisetup@gmail.com
- [ ] Set up a "Free 15-Minute Consultation" event type
- [ ] Replace all `https://cal.com/ryansaisetup/consultation` links in index.html with your actual Cal.com booking URL
- [ ] (Optional) Add a headshot photo in the About section
- [ ] (Optional) Create Stripe Payment Links and wire them to the pricing buttons
- [ ] (Optional) Buy a custom domain and point it to GitHub Pages

## Custom Domain Setup

Once you buy a domain (e.g., ryansaisetup.com):

1. In your GitHub repo, go to **Settings > Pages > Custom domain**
2. Enter your domain name
3. At your domain registrar, add these DNS records:
   - `A` record pointing to `185.199.108.153`
   - `A` record pointing to `185.199.109.153`
   - `A` record pointing to `185.199.110.153`
   - `A` record pointing to `185.199.111.153`
   - `CNAME` record for `www` pointing to `sitting-sucks.github.io`
4. Check "Enforce HTTPS" in GitHub Pages settings
