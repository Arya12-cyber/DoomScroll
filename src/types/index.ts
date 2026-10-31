// Core Type Definitions for Karmayogi: The Klesha Slayer (कर्मयोगी: डिजिटल क्लेश संहार)

export type ChoreModuleId =
  | 'agni-pariksha'
  | 'mandara-sifter'
  | 'chitragupta-ledger'
  | 'vritra-vyuha'
  // Backward compatibility alias
  | 'nebula-purge'
  | 'gravity-sifter'
  | 'neon-audit'
  | 'glitch-exterminator';

export type ExecutionMode = 'sacred_simulation' | 'live_connect' | 'arcade' | 'live';

// ==================== TRANSACTION LEDGER ====================
export type TransactionActionType =
  // Module 1: Agni Pariksha (Inbox Zero)
  | 'TRASH_EMAIL'
  | 'UNSUBSCRIBE_AND_ARCHIVE'
  | 'TAG_RECEIPT'
  | 'TAG_AND_ARCHIVE'
  | 'BULK_NUKE_EMAILS'
  // Module 2: Mandara Sifter (Downloads & Desktop)
  | 'MOVE_FILE'
  | 'DELETE_FILE'
  | 'COMPRESS_FILES'
  // Module 3: Chitragupta's Ledger (Expense Audit)
  | 'APPROVE_BUSINESS_EXPENSE'
  | 'FLAG_PERSONAL_EXPENSE'
  | 'DISPUTE_EXPENSE'
  // Module 4: Vritra's Vyuha (Lint & Prettier)
  | 'APPLY_LINT_FIX'
  | 'REMOVE_UNUSED_IMPORT'
  | 'STRIP_CONSOLE_LOG'
  | 'INSERT_SEMICOLON';

export interface ChoreTransaction {
  id: string;
  timestamp: number;
  moduleId: ChoreModuleId;
  actionType: TransactionActionType;
  title: string;
  description: string;
  targetId: string;
  targetName: string;
  originalState: any;
  newState: any;
  status: 'pending' | 'executed' | 'undone' | 'failed' | 'yamaloka_staged' | 'in_flight';
  stagedUntil?: number; // 30-day Yamaloka staging epoch
  isVipProtected?: boolean;
  megabytesFreed?: number;
  reclaimedSeconds?: number;
  monetaryValue?: number;
  punyaGained?: number;
  executionMode: ExecutionMode;
}

// ==================== REAL DIGITAL ARTIFACTS ====================

// Module 1: Email Artifact (Spam ravens, newsletters, invoice carrier pigeons)
export interface EmailArtifact {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  date: string;
  sizeKb: number;
  type: 'spam' | 'newsletter' | 'receipt' | 'backlog_cluster';
  status: 'unread' | 'trashed' | 'archived' | 'receipt_filed';
  unsubscribeUrl?: string;
  mythicCreature?: 'kakasura' | 'locust' | 'golden_pigeon' | 'kumbhakarna_shard';
  isVip?: boolean;
  vipReason?: string;
  kavachaActive?: boolean;
}

// Module 2: File Artifact (Scrolls, copper plates, screenshots, installers)
export interface FileArtifact {
  id: string;
  name: string;
  extension: string;
  sizeBytes: number;
  createdDate: string;
  originalPath: string;
  currentPath: string;
  category: 'screenshot' | 'pdf' | 'installer' | 'archive' | 'messy_temp';
  status: 'in_downloads' | 'in_documents' | 'in_pictures' | 'trashed' | 'compressed';
  artifactTypeLabel?: string; // e.g. "ताम्रपत्रम् (Copper Plate)", "ग्रन्थ स्क्रोल (Parchment)"
  isVip?: boolean;
  vipReason?: string;
  kavachaActive?: boolean;
}

// Module 3: Expense Transaction Artifact (Chitragupta's Karmic Ledger)
export interface ExpenseArtifact {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  account: string;
  suggestedCategory: string;
  assignedCategory?: string;
  confidence: number;
  ocrSnippet: string;
  receiptMatched: boolean;
  status: 'pending_review' | 'business_approved' | 'personal_flagged' | 'disputed';
  karmicClassification?: 'dharma' | 'kama' | 'vivada';
}

// Module 4: Code Issue Artifact (Vritra's Glitch Monsters)
export interface CodeIssueArtifact {
  id: string;
  filePath: string;
  line: number;
  column: number;
  issueType: 'missing-semicolon' | 'unused-import' | 'console-log' | 'var-to-const';
  rawSnippet: string;
  fixedSnippet: string;
  description: string;
  status: 'unfixed' | 'fixed';
  monsterName?: string; // e.g. "; वृश्चिक (Scorpion)", "कीट (Wasp)", "पिशाच (Goblin)"
}

// ==================== HUD & GAME METRICS ====================
export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  megabytesFreed: number;
  itemsProcessed: number;
  secondsSaved: number;
  dollarsAudited: number;
  codeSmellsPurged: number;
  // Karmic Metrics
  karmaPoints: number;        // पुण्य (Punya)
  kleshasCleansed: number;    // क्लेश शुद्धि
  megabytesPurified: number;  // शुद्धीकृत डेटा
  tapasyaMultiplier: number;  // तपस्या गुणक
}

// ==================== SARATHI AI CO-PILOT ====================
export interface SarathiEscalation {
  id: string;
  title: string;
  description: string;
  riskLevel: 'medium' | 'high';
  aiConfidence: number; // 0.0 - 1.0
  reason: string;
  targetArtifact: any;
  moduleId: ChoreModuleId;
  suggestedActionLabel: string;
  options: Array<{
    id: string;
    label: string;
    description: string;
    isRecommended?: boolean;
    actionType: 'approve' | 'reject' | 'divert' | 'quarantine';
  }>;
}

export interface SarathiStats {
  autoSlayedCount: number;
  escalationsHandled: number;
  aiAccuracy: number;
}
