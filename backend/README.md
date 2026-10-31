# 🪔 Karmayogi Backend Service (कर्मयोगी बैकएंड)

The backend engine for **Karmayogi: The Klesha Slayer** (कर्मयोगी: डिजिटल क्लेश संहार).

## Features
- **Ambient Clutter Scanner (`/api/clutter`)**: Inspects local filesystem (`~/Downloads`, `~/Desktop`) and computes real-time **Chitta Shuddhi Entropy (0-100)**.
- **Physical Chore Ledger (`/api/ledger`)**: Stores atomic action histories with time-machine undo (`/api/ledger/rollback`).
- **Sarathi AI Telemetry (`/api/sarathi/status`)**: Coordinates autonomous background co-pilots and confidence escalation trees.
- **Health & Telemetry (`/api/health`)**: Server uptime and operational metrics.

## Quick Start

```bash
# Start backend API server (port 3001)
bun run dev

# Or with npm/node
bun src/index.ts

# Run the ambient clutter daemon in terminal
bun run daemon
```

## API Endpoints
- `GET /` — API Directory & Service Status
- `GET /api/health` — Health check & uptime
- `GET /api/clutter` — Downloads & Desktop clutter audit
- `GET /api/ledger` — Transaction history & stats
- `POST /api/ledger/record` — Record chore mutation
- `POST /api/ledger/rollback` — Global or single-item undo (Pratyahara)
- `GET /api/sarathi/status` — Sarathi AI agent rules & status
