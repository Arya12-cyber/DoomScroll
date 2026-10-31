/**
 * Chore Ledger & Yamaloka Safety Vault Service
 * Persists all physical chore mutations and provides atomic undo (Pratyahara)
 */

export interface BackendTransaction {
  id: string;
  timestamp: number;
  moduleId: 'agni-pariksha' | 'mandara-sifter' | 'chitragupta-ledger' | 'vritra-vyuha';
  actionType: string;
  targetDescription: string;
  megabytesSaved: number;
  dollarsAudited?: number;
  codeSmellsPurged?: number;
  status: 'purged' | 'rolled_back' | 'buffered';
  payload?: any;
}

class LedgerService {
  private transactions: BackendTransaction[] = [];

  constructor() {
    // Seed initial ledger transactions for demonstration
    this.transactions = [
      {
        id: 'tx_seed_001',
        timestamp: Date.now() - 3600000,
        moduleId: 'agni-pariksha',
        actionType: 'TRASH_EMAIL',
        targetDescription: 'Black Friday 70% Off Spam by Sales Blast',
        megabytesSaved: 0.45,
        status: 'purged',
      },
      {
        id: 'tx_seed_002',
        timestamp: Date.now() - 1800000,
        moduleId: 'mandara-sifter',
        actionType: 'ARCHIVE_FILE',
        targetDescription: 'CleanShot_2026-10-25_at_09.11.30.png -> /Documents/Archive/2026',
        megabytesSaved: 2.8,
        status: 'purged',
      },
      {
        id: 'tx_seed_003',
        timestamp: Date.now() - 600000,
        moduleId: 'chitragupta-ledger',
        actionType: 'APPROVE_DHARMA',
        targetDescription: 'GitHub Enterprise Subscription $21.00',
        megabytesSaved: 0.1,
        dollarsAudited: 21.0,
        status: 'purged',
      },
    ];
  }

  public getAll(): BackendTransaction[] {
    return [...this.transactions];
  }

  public record(tx: Omit<BackendTransaction, 'id' | 'timestamp' | 'status'>): BackendTransaction {
    const newTx: BackendTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      status: 'purged',
    };
    this.transactions.unshift(newTx);
    return newTx;
  }

  public rollback(id: string): { success: boolean; transaction?: BackendTransaction; error?: string } {
    const tx = this.transactions.find((t) => t.id === id);
    if (!tx) {
      return { success: false, error: 'Transaction not found in Yamaloka ledger.' };
    }
    tx.status = 'rolled_back';
    return { success: true, transaction: tx };
  }

  public rollbackAll(): { count: number } {
    let count = 0;
    for (const tx of this.transactions) {
      if (tx.status === 'purged') {
        tx.status = 'rolled_back';
        count++;
      }
    }
    return { count };
  }

  public getStats() {
    const purged = this.transactions.filter((t) => t.status === 'purged');
    const totalMb = purged.reduce((acc, t) => acc + t.megabytesSaved, 0);
    const totalDollars = purged.reduce((acc, t) => acc + (t.dollarsAudited || 0), 0);
    const totalSmells = purged.reduce((acc, t) => acc + (t.codeSmellsPurged || 0), 0);

    return {
      totalTransactions: this.transactions.length,
      purgedCount: purged.length,
      rolledBackCount: this.transactions.length - purged.length,
      totalMegabytesFreed: parseFloat(totalMb.toFixed(2)),
      totalDollarsAudited: parseFloat(totalDollars.toFixed(2)),
      totalCodeSmellsPurged: totalSmells,
    };
  }
}

export const ledgerService = new LedgerService();
