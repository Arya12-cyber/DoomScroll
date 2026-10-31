/**
 * Karmayogi Backend Service
 * Fast, lightweight Bun HTTP Server providing real physical chore execution endpoints.
 */

import { scanDirectory } from './services/clutterScanner';
import { ledgerService } from './services/ledgerService';

const PORT = parseInt(process.env.PORT || '3001', 10);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // 1. Root / Schedulers Info
      if (url.pathname === '/' || url.pathname === '/api') {
        return jsonResponse({
          service: 'Karmayogi: The Klesha Slayer Backend',
          version: '1.0.0',
          mantra: 'योगः कर्मसु कौशलम् (Excellence in Action is Yoga)',
          status: 'online',
          endpoints: [
            { path: '/api/health', method: 'GET', description: 'System health & Chitta Shuddhi status' },
            { path: '/api/clutter', method: 'GET', description: 'Scan ~/Downloads & Desktop for clutter' },
            { path: '/api/ledger', method: 'GET', description: 'List all physical chore transactions' },
            { path: '/api/ledger/record', method: 'POST', description: 'Record a chore transaction' },
            { path: '/api/ledger/rollback', method: 'POST', description: 'Time-Machine Undo (Pratyahara)' },
            { path: '/api/sarathi/status', method: 'GET', description: 'Sarathi Autonomous AI Co-pilot status' },
          ],
        });
      }

      // 2. Health & Telemetry
      if (url.pathname === '/api/health') {
        return jsonResponse({
          status: 'healthy',
          timestamp: Date.now(),
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          environment: process.env.NODE_ENV || 'development',
        });
      }

      // 3. Clutter Scanner API
      if (url.pathname === '/api/clutter') {
        const customPath = url.searchParams.get('path') || undefined;
        const report = scanDirectory(customPath);
        return jsonResponse(report);
      }

      // 4. Ledger - List Transactions
      if (url.pathname === '/api/ledger' && req.method === 'GET') {
        return jsonResponse({
          transactions: ledgerService.getAll(),
          stats: ledgerService.getStats(),
        });
      }

      // 5. Ledger - Record Chore Transaction
      if (url.pathname === '/api/ledger/record' && req.method === 'POST') {
        const body = await req.json();
        if (!body.moduleId || !body.actionType || !body.targetDescription) {
          return jsonResponse({ error: 'Missing required transaction fields' }, 400);
        }
        const recorded = ledgerService.record(body);
        return jsonResponse({ success: true, transaction: recorded });
      }

      // 6. Ledger - Rollback Transaction
      if (url.pathname === '/api/ledger/rollback' && req.method === 'POST') {
        const body = await req.json();
        if (body.all) {
          const result = ledgerService.rollbackAll();
          return jsonResponse({ success: true, rolledBackCount: result.count });
        }
        if (!body.id) {
          return jsonResponse({ error: 'Transaction ID required for rollback' }, 400);
        }
        const result = ledgerService.rollback(body.id);
        if (!result.success) {
          return jsonResponse({ error: result.error }, 404);
        }
        return jsonResponse({ success: true, transaction: result.transaction });
      }

      // 7. Sarathi Autonomous AI Co-Pilot Status
      if (url.pathname === '/api/sarathi/status') {
        return jsonResponse({
          agent: 'सारथि (Sarathi Nishkama Co-Pilot)',
          active: true,
          mode: 'autonomous_with_escalation',
          confidenceThreshold: 0.95,
          escalationRules: [
            'Receipts > $500 require human Sankalpa affirmation',
            'VIP / Investor emails pause time dilation for manual net swipe',
            'Executable files (.dmg, .pkg, .sh) confirm before permanent pyre',
          ],
        });
      }

      return jsonResponse({ error: `Not found: ${url.pathname}` }, 404);
    } catch (err: any) {
      console.error('API Error:', err);
      return jsonResponse({ error: err.message || 'Internal server error' }, 500);
    }
  },
});

console.log(`🪔 कर्मयोगी (Karmayogi) Backend running at: http://localhost:${PORT}`);
