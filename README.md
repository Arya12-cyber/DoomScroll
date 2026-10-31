# ⚔️ SHADOW OPERATOR: THE CHORE SLAYER

> **"Procrastination Weaponized into Pure Dopamine."**  
> Built for the **Google Antigravity Agentic IDE**.

**Shadow Operator: The Chore Slayer** is a high-octane retro-arcade web application where playing nostalgic, visually stunning video games in the foreground physically executes painful, procrastinated digital chores in the background:
- **Inbox Zero** (Gmail / IMAP cleaning)
- **Desktop & Downloads Sorting** (Disk hygiene & organization)
- **Expense Auditing** (Receipt matching & tax categorization)
- **Codebase Lint Fixing** (ESLint, Prettier, unused imports, AST pruning)

---

## 🕹️ ARCHITECTURE: THE "PUPPETEER" DUAL-ENGINE

The core architecture operates via a two-way reactive bridge connecting a 60 FPS HTML5 Canvas game engine to an atomic chore transaction ledger:

```
┌────────────────────────────────────────────────────────┐
│               THE ILLUSION (GAME LAYER)                │
│  60 FPS Canvas | Web Audio API | Combos | Screen Shake │
└───────────────────────────▲────────────────────────────┘
                            │ (Game Kills & Actions)
                            ▼
┌────────────────────────────────────────────────────────┐
│             PUPPETEER REVERSE BRIDGE                   │
│   Action Dispatcher -> Atomic Transaction Creator      │
└───────────────────────────▲────────────────────────────┘
                            │ (Transactions & State Rollback)
                            ▼
┌────────────────────────────────────────────────────────┐
│              THE REALITY (DIGITAL VAULT)               │
│   Gmail API / APFS File System / Plaid / AST Lint Run  │
└────────────────────────────────────────────────────────┘
```

1. **The Game Layer (The Illusion):**
   - High game juice: dynamic screen shake, procedural floating damage text, particle bursts, and Web Audio API procedural synthesis.
   - Every enemy, falling orb, card, or bug is strictly bound to an authentic digital artifact.

2. **The Chore Worker & Safety Vault (The Reality):**
   - **Transaction Ledger (`transactionStore.ts`)**: Every game action generates a reversible ledger entry (`TRASH_EMAIL`, `MOVE_FILE`, `APPROVE_BUSINESS_EXPENSE`, `APPLY_LINT_FIX`).
   - **Time-Machine Undo Drawer**: Persistent drawer at the bottom of the screen. Review live transaction payloads, undo single operations, or hit **"Global Time-Machine Rewind"** to revert all changes safely.
   - **Dual Execution Modes**:
     - **Arcade Simulation (Default)**: Pre-seeded with 500+ realistic emails, download files, financial line items, and code bugs.
     - **Live Connect**: Pluggable interfaces for browser File System Access API, Gmail API, and CSV bank imports.

3. **The "Reality Lens" Split-View (`[Tab]` Key)**:
   - Press `Tab` at any second to flip the viewport from the Arcade game into the **Physical Desk View** (Gmail table, APFS directory tree, Tax ledger, or Git code diff).

---

## 🎮 THE 4 PLAYABLE CHORE MODULES

### Module A: "Nebula Purge" (Inbox Zero — Vampire Survivors / Galaga Style)
- **The Chore**: Slaying unread marketing spam, newsletters, and receipts.
- **Weapons**:
  - `[1] Laser Cannon`: Vaporizes Red Spam Drones (`TRASH_EMAIL`).
  - `[2] EMP Missile`: Dispatches One-Click Unsubscribes to Purple Cruisers (`UNSUBSCRIBE_AND_ARCHIVE`).
  - `[3] Tractor Beam`: Locks onto Gold Cargo Ships and tags receipts into tax folders (`TAG_AND_ARCHIVE`).
  - **Boss Mothership ("The 2021 Backlog")**: 2,000 unread emails health bar. Chipping its hull disintegrates bulk batches of 25-100 emails at a time!

### Module B: "Gravity Sifter" (Desktop & Downloads Clutter — Physics Sorter)
- **The Chore**: Organizing chaotic Downloads folder cluttered with screenshots, PDFs, installers, and logs.
- **Mechanics**: 2D elastic physics chamber. Files drop as bouncy spheres/crates with authentic filenames.
- **Portals**:
  - **Blue Wormhole**: Routes to `/Documents/PDFs/2026`.
  - **Green Wormhole**: Routes to `/Pictures/Screenshots`.
  - **Purple Compressor**: Batches items into `.zip` archives.
  - **Black Hole**: Permanently deletes temporary junk files to `~/.Trash`.
- **Tractor Magnet**: Press the Magnet button to attract files to their matching portals!

### Module C: "Neon Audit" (Expense & Receipt Review — 120 BPM Reigns / Rhythm Swipe)
- **The Chore**: Classifying messy business expenses and tax deductions.
- **Mechanics**: Cyberpunk card stack with synthwave audio pulse.
- **Gestures / Keys**:
  - **Swipe Right / [D]**: Approved as Business Expense (tags tax deduction).
  - **Swipe Left / [A]**: Flagged as Personal (excluded from tax report).
  - **Swipe Up / [W]**: Disputed / Split expense.

### Module D: "Glitch Exterminator" (Code Smells — Rogue-lite Slasher)
- **The Chore**: Auto-fixing ESLint, Prettier, unused imports, and console.logs.
- **Mechanics**: Neon dungeon slasher where bugs are literal pixel monsters:
  - **Semicolon Scorpions**: Slashing auto-inserts semicolons.
  - **Unused Import Wasps**: Slashing runs AST dead-code tree-shaking.
  - **Console.log Goblins**: Slashing strips debugging statements.
- **Live AST Diff Dock**: Live code diff updates on-screen with green/red lines in real time!

---

## 🔊 PROCEDURAL AUDIO (100% ZERO-ASSET DEPENDENCY)

No external audio assets or broken links. All sound effects are procedurally generated via native **Web Audio API** oscillators, biquad filters, white noise buffers, and gain envelopes:
- Laser frequency drops
- EMP resonant low-pass sweeps
- Sub-bass explosions
- Arpeggiated Major 7th coin approval chords
- Katana metallic slashes
- Time-machine reverse pitch sweeps

---

## 🚀 ZERO-CONFIG QUICK START

Run immediately:

```bash
# Start dev server
bun run dev
# or
npm run dev

# Or build for production
bun run build
bun run preview
```

Open `http://localhost:5173` in your browser.
