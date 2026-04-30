# TheSubhub Order Tracker

This project is a browser-based order tracker with Supabase sync and Discord webhook notifications.

## Local setup

1. Install Node.js if you haven't already.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from `.env.example` and fill in your Supabase keys.
   Add `DISCORD_WEBHOOK_URL` if you want Discord expiry notifications.

4. Start the local server:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## GitHub setup

1. Initialize git in the project folder:

```bash
git init
git add .
git commit -m "Initial project commit"
```

2. Create a GitHub repository and add it as remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Vercel deployment

1. Install Vercel CLI if needed:

```bash
npm install -g vercel
```

2. Login:

```bash
vercel login
```

3. Add environment variables:

```bash
vercel env add SUPABASE_URL https://psffmvpxgvljaafbkian.supabase.co production
vercel env add SUPABASE_SERVICE_ROLE_KEY YOUR_SERVICE_ROLE_KEY production
vercel env add SUPABASE_ANON_KEY sb_publishable__J9k1uSZXaWem6s5aGbKqA_f80WefrT production
vercel env add DISCORD_WEBHOOK_URL YOUR_ROTATED_DISCORD_WEBHOOK_URL production
```

4. Deploy:

```bash
vercel --prod
```

## Notes

- Do not commit `.env` to GitHub.
- Do not put Discord webhook URLs in `index.html`; store them in backend environment variables only.
- The serverless API route is in `api/orders.js`.
- The Discord notification route is in `api/notify.js`.
- The Vercel config is in `vercel.json`.
