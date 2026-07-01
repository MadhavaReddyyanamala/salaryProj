# Ledger — Personal Finance Tracker

A clean, mobile-friendly web app for tracking salary, expenses, debts, and
savings goals. Built with React + Vite.

Right now all data lives in memory (it resets on page reload). The steps
below get it live on the web; a later step can add persistent storage if
you want data to survive reloads.

## 1. Run it locally first (optional but recommended)

You'll need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`) to check everything
looks right before deploying.

## 2. Deploy — easiest path: Vercel

1. Push this folder to a GitHub repo (see step below if you haven't).
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click **Add New → Project**.
3. Select your repo. Vercel auto-detects Vite — leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. You'll get a live `https://your-app.vercel.app` URL in
   about a minute, and every future push to `main` redeploys automatically.

## 2b. Alternative: Netlify

1. Push to GitHub (see below).
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import an existing project**.
3. Pick your repo. Build command: `npm run build`, publish directory: `dist`.
4. Click **Deploy site**.

## 2c. Alternative: GitHub Pages

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
"homepage": "https://<your-username>.github.io/<repo-name>",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Then:
```bash
npm run deploy
```

Your site will be live at the `homepage` URL above within a few minutes.

## Pushing this folder to GitHub (needed for Vercel/Netlify)

```bash
cd ledger-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Create the empty repo on GitHub first (github.com → New repository) before
running the last two lines.

## Project structure

```
ledger-app/
├── index.html        # entry HTML
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx       # mounts the app
│   └── App.jsx         # the whole application
└── README.md
```

## Notes

- Mobile responsiveness is built in — the layout collapses to a single
  column below ~720px, so it works as a mobile web app as-is. Wrapping it
  in Capacitor or React Native later is possible if you want a native app
  store listing, but isn't required to use it on a phone.
- Data resets on refresh right now. If you want entries to persist between
  visits, the simplest options are: browser storage (quick, per-device
  only), or a small backend/database (e.g. Supabase or Firebase) if you
  want the same data across devices — happy to build either when you're
  ready.
