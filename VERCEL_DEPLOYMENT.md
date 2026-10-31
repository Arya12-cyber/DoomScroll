# 🚀 Karmayogi: Vercel Deployment Guide

This repository is pre-configured for **instant 1-click zero-config deployment on Vercel**.

---

## 📁 Repository Structure

```
DoomScroll/
├── frontend/               # React 19 + TypeScript + Tailwind + HTML5 Canvas Arcade
│   ├── src/                # Game modules, Vedic sound engine, UI components
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── vercel.json         # Sub-folder Vercel config (if deploying frontend only)
│
├── backend/                # Fast Bun / Node API Service & Clutter Daemon
│   ├── src/index.ts        # HTTP Server with /api routes
│   ├── src/services/       # Clutter scanner & Yamaloka chore ledger
│   ├── scripts/            # karmayogi-daemon.ts CLI
│   └── package.json
│
├── api/                    # Vercel Serverless Functions (Auto-deployed on Edge)
│   ├── health.ts           # GET /api/health
│   ├── clutter.ts          # GET /api/clutter
│   ├── ledger.ts           # GET/POST /api/ledger
│   └── sarathi.ts          # GET /api/sarathi
│
├── vercel.json             # Root Vercel configuration
├── .vercelignore           # Optimized upload exclusions
└── package.json            # Monorepo workspace orchestrator
```

---

## 🛠️ Option 1: Deploy with Vercel CLI (Recommended)

1. Open your terminal in this directory:
   ```bash
   npm i -g vercel
   ```

2. Run the deployment command:
   ```bash
   vercel
   ```

3. Follow the interactive prompts:
   - **Set up and deploy?** [Y]
   - **Which scope?** (Select your personal or team account)
   - **Link to existing project?** [N]
   - **What's your project's name?** `karmayogi-klesha-slayer`
   - **In which directory is your code located?** `./` (Press Enter)

4. For production:
   ```bash
   vercel --prod
   ```

---

## 🌐 Option 2: Deploy via GitHub / Vercel Dashboard

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Karmayogi frontend, backend and Vercel configs"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. In the **Vercel Dashboard** ([vercel.com/new](https://vercel.com/new)):
   - Click **Import** next to your repository.
   - **Framework Preset**: Vite
   - **Root Directory**: Leave as `./` (or select `frontend` if deploying frontend alone)
   - **Build Command**: `bun run build` (or leave default)
   - **Output Directory**: `frontend/dist` (pre-configured in `vercel.json`)
   - Click **Deploy**!

---

## ⚡ Live Vercel Endpoints Included

When deployed on Vercel, the following serverless endpoints are live automatically:
* `https://<your-project>.vercel.app/` — Full Karmayogi Retro Arcade & Reality Lens
* `https://<your-project>.vercel.app/api/health` — System status
* `https://<your-project>.vercel.app/api/clutter` — Clutter scanner & Chitta Shuddhi telemetry
* `https://<your-project>.vercel.app/api/ledger` — Yamaloka physical chore transaction store
* `https://<your-project>.vercel.app/api/sarathi` — Sarathi autonomous co-pilot rules
