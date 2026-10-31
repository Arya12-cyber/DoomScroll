import { create } from 'zustand';
import {
  ChoreTransaction,
  ChoreModuleId,
  ExecutionMode,
  EmailArtifact,
  FileArtifact,
  ExpenseArtifact,
  CodeIssueArtifact,
  GameStats,
  SarathiEscalation,
  SarathiStats,
} from '../../types';
import {
  generateMockEmails,
  generateMockFiles,
  generateMockExpenses,
  generateMockCodeIssues,
} from '../mock/mockDataEngine';
import { sound } from '../audio/soundEngine';
import { vedicSound } from '../audio/VedicSoundEngine';
import {
  trashGmailMessage,
  fetchGmailMessages,
  saveGmailSession,
  clearGmailSession,
  getSavedGmailSession,
} from '../connectors/gmailConnector';

interface TransactionStoreState {
  // Global View Controls
  activeModule: ChoreModuleId | null;
  isRealityLensOpen: boolean;
  isDrawerOpen: boolean;
  isCrtEnabled: boolean;
  isSoundMuted: boolean;
  isTanpuraEnabled: boolean;
  soundVolume: number;
  isScreenShakeEnabled: boolean;
  isTutorialOpen: boolean;
  executionMode: ExecutionMode;

  // Real Digital Artifacts (Physical Reality)
  emails: EmailArtifact[];
  files: FileArtifact[];
  expenses: ExpenseArtifact[];
  codeIssues: CodeIssueArtifact[];

  // Ledger & Time-Machine
  transactions: ChoreTransaction[];
  offlineYajnaBuffer: ChoreTransaction[];
  stats: GameStats;

  // Sarathi AI Co-Pilot (Autopilot & Escalation)
  isSarathiAutopilotEnabled: boolean;
  sarathiSpeed: 1 | 2 | 3;
  sarathiStats: SarathiStats;
  activeEscalation: SarathiEscalation | null;

  toggleSarathiAutopilot: () => void;
  setSarathiSpeed: (speed: 1 | 2 | 3) => void;
  triggerEscalation: (escalation: SarathiEscalation) => void;
  resolveEscalation: (optionId: string) => void;
  dismissEscalation: () => void;

  // Live Email Connection
  liveAccountEmail: string | null;
  gmailAccessToken: string | null;
  isSyncingGmail: boolean;
  lastGmailSyncTime: number | null;
  isMailConnectModalOpen: boolean;
  setMailConnectModalOpen: (open: boolean) => void;
  connectLiveEmails: (accountEmail: string, importedEmails: EmailArtifact[], token?: string, clientId?: string) => void;
  disconnectLiveEmails: () => void;
  syncRealGmail: () => Promise<boolean>;

  // Actions
  setActiveModule: (module: ChoreModuleId | null) => void;
  toggleRealityLens: () => void;
  setRealityLens: (open: boolean) => void;
  toggleRealityDrawer: () => void;
  setRealityDrawer: (open: boolean) => void;
  toggleCrt: () => void;
  toggleSound: () => void;
  toggleTanpura: () => void;
  setSoundVolume: (vol: number) => void;
  toggleScreenShake: () => void;
  toggleTutorial: () => void;
  setExecutionMode: (mode: ExecutionMode) => void;
  resetMockData: () => void;

  // Transaction Ledger Operations
  recordTransaction: (tx: Omit<ChoreTransaction, 'id' | 'timestamp' | 'status' | 'executionMode'>) => ChoreTransaction;
  undoTransaction: (transactionId: string) => void;
  undoAllTransactions: () => void;
  flushYajnaBuffer: () => void;
  restoreFromYamaloka: (transactionId: string) => void;
  permanentPurgeFromYamaloka: (transactionId: string) => void;

  // Module 1 (Agni Pariksha): Email Chore Actions
  addCustomEmail: (email: {
    sender: string;
    senderEmail?: string;
    subject: string;
    preview?: string;
    type: 'spam' | 'newsletter' | 'receipt';
    sizeKb?: number;
    isVip?: boolean;
  }) => EmailArtifact;
  trashEmail: (emailId: string) => void;
  unsubscribeEmail: (emailId: string) => void;
  archiveReceiptEmail: (emailId: string) => void;
  bulkNukeEmails: (count: number) => void;

  // Module 2 (Mandara Sifter): File Chore Actions
  moveFile: (fileId: string, destinationFolder: string, category: 'screenshot' | 'pdf' | 'installer' | 'archive' | 'messy_temp') => void;
  deleteFile: (fileId: string) => void;
  compressFile: (fileId: string) => void;

  // Module 3 (Chitragupta's Ledger): Expense Chore Actions
  approveBusinessExpense: (expenseId: string) => void;
  flagPersonalExpense: (expenseId: string) => void;
  disputeExpense: (expenseId: string) => void;

  // Module 4 (Vritra's Vyuha): Code Smells Chore Actions
  fixCodeIssue: (issueId: string) => void;

  // Combo & Score Actions
  addScore: (points: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
}

export const useTransactionStore = create<TransactionStoreState>((set, get) => ({
  activeModule: null,
  isRealityLensOpen: false,
  isDrawerOpen: false,
  isCrtEnabled: true,
  isSoundMuted: false,
  isTanpuraEnabled: false,
  soundVolume: 0.6,
  isScreenShakeEnabled: true,
  isTutorialOpen: false,
  executionMode: 'sacred_simulation',

  emails: generateMockEmails(),
  files: generateMockFiles(),
  expenses: generateMockExpenses(),
  codeIssues: generateMockCodeIssues(),

  transactions: [],
  offlineYajnaBuffer: [],
  stats: {
    score: 0,
    combo: 0,
    maxCombo: 0,
    megabytesFreed: 0,
    itemsProcessed: 0,
    secondsSaved: 0,
    dollarsAudited: 0,
    codeSmellsPurged: 0,
    karmaPoints: 0,
    kleshasCleansed: 0,
    megabytesPurified: 0,
    tapasyaMultiplier: 1,
  },

  // Sarathi AI Co-Pilot
  isSarathiAutopilotEnabled: false,
  sarathiSpeed: 1,
  sarathiStats: {
    autoSlayedCount: 0,
    escalationsHandled: 0,
    aiAccuracy: 99.4,
  },
  activeEscalation: null,

  toggleSarathiAutopilot: () => {
    vedicSound.init();
    const nextState = !get().isSarathiAutopilotEnabled;
    if (nextState) {
      vedicSound.playTempleBell(1.4, 2.5);
      vedicSound.playPunyaChime();
    } else {
      vedicSound.playTempleBell(0.8, 1.5);
    }
    set({ isSarathiAutopilotEnabled: nextState });
  },

  setSarathiSpeed: (sarathiSpeed) => {
    vedicSound.init();
    vedicSound.playMridangam('chaapu');
    set({ sarathiSpeed });
  },

  triggerEscalation: (activeEscalation) => {
    vedicSound.init();
    vedicSound.playTempleBell(1.8, 3.5);
    set({ activeEscalation });
  },

  resolveEscalation: (optionId: string) => {
    const esc = get().activeEscalation;
    if (!esc) return;

    vedicSound.init();
    vedicSound.playMridangam('bass');
    vedicSound.playPunyaChime();

    const opt = esc.options.find((o) => o.id === optionId) || esc.options[0];
    if (esc.moduleId === 'chitragupta-ledger' && esc.targetArtifact) {
      if (opt.actionType === 'approve') get().approveBusinessExpense(esc.targetArtifact.id);
      else if (opt.actionType === 'reject') get().flagPersonalExpense(esc.targetArtifact.id);
      else get().disputeExpense(esc.targetArtifact.id);
    } else if (esc.moduleId === 'agni-pariksha' && esc.targetArtifact) {
      if (opt.actionType === 'approve') get().trashEmail(esc.targetArtifact.id);
      else if (opt.actionType === 'quarantine') get().unsubscribeEmail(esc.targetArtifact.id);
      else get().archiveReceiptEmail(esc.targetArtifact.id);
    } else if (esc.moduleId === 'mandara-sifter' && esc.targetArtifact) {
      if (opt.actionType === 'approve') get().deleteFile(esc.targetArtifact.id);
      else if (opt.actionType === 'divert') get().moveFile(esc.targetArtifact.id, '/Documents/Vault', 'pdf');
      else get().compressFile(esc.targetArtifact.id);
    }

    set((state) => ({
      activeEscalation: null,
      sarathiStats: {
        ...state.sarathiStats,
        escalationsHandled: state.sarathiStats.escalationsHandled + 1,
      },
    }));
  },

  dismissEscalation: () => {
    set({ activeEscalation: null });
  },

  // Live Email Connection State & Actions
  liveAccountEmail: getSavedGmailSession().email || null,
  gmailAccessToken: getSavedGmailSession().token || null,
  isSyncingGmail: false,
  lastGmailSyncTime: getSavedGmailSession().token ? Date.now() : null,
  isMailConnectModalOpen: false,

  setMailConnectModalOpen: (isMailConnectModalOpen) => {
    vedicSound.init();
    vedicSound.playTempleBell(1.2, 1.8);
    set({ isMailConnectModalOpen });
  },

  connectLiveEmails: (accountEmail, importedEmails, token, clientId) => {
    vedicSound.init();
    vedicSound.playTempleBell(1.6, 3.5);
    vedicSound.playPunyaChime();
    if (token) {
      saveGmailSession(token, accountEmail, clientId);
    }
    set({
      liveAccountEmail: accountEmail,
      gmailAccessToken: token || null,
      emails: importedEmails,
      lastGmailSyncTime: Date.now(),
      executionMode: 'live_connect',
      isMailConnectModalOpen: false,
    });
  },

  disconnectLiveEmails: () => {
    vedicSound.init();
    vedicSound.playTempleBell(0.8, 2.0);
    clearGmailSession();
    set({
      liveAccountEmail: null,
      gmailAccessToken: null,
      emails: generateMockEmails(),
      lastGmailSyncTime: null,
      executionMode: 'sacred_simulation',
    });
  },

  syncRealGmail: async () => {
    const token = get().gmailAccessToken;
    if (!token) {
      set({ isMailConnectModalOpen: true });
      return false;
    }

    set({ isSyncingGmail: true });
    vedicSound.init();
    vedicSound.playTempleBell(1.4, 2.0);

    try {
      const result = await fetchGmailMessages({ accessToken: token, maxResults: 30, query: 'is:unread' });
      if (result.emails.length > 0) {
        set({
          emails: result.emails,
          liveAccountEmail: result.accountEmail,
          lastGmailSyncTime: Date.now(),
          isSyncingGmail: false,
        });
        vedicSound.playPunyaChime();
        return true;
      }
    } catch (err) {
      console.error('Failed to sync Gmail:', err);
      set({ isSyncingGmail: false, isMailConnectModalOpen: true });
      return false;
    }

    set({ isSyncingGmail: false });
    return true;
  },

  setActiveModule: (activeModule) => {
    sound.init();
    vedicSound.init();
    set({ activeModule });
  },

  toggleRealityLens: () => {
    sound.init();
    vedicSound.init();
    vedicSound.playTempleBell(1.2, 1.5);
    set((state) => ({ isRealityLensOpen: !state.isRealityLensOpen }));
  },

  setRealityLens: (isRealityLensOpen) => {
    sound.init();
    vedicSound.init();
    vedicSound.playTempleBell(1.2, 1.5);
    set({ isRealityLensOpen });
  },

  toggleRealityDrawer: () => {
    set((state) => ({ isDrawerOpen: !state.isDrawerOpen }));
  },

  setRealityDrawer: (isDrawerOpen) => {
    set({ isDrawerOpen });
  },

  toggleCrt: () => {
    set((state) => ({ isCrtEnabled: !state.isCrtEnabled }));
  },

  toggleSound: () => {
    sound.init();
    vedicSound.init();
    const muted = !get().isSoundMuted;
    sound.setMuted(muted);
    vedicSound.setMuted(muted);
    set({ isSoundMuted: muted });
  },

  toggleTanpura: () => {
    vedicSound.init();
    const active = vedicSound.toggleTanpura();
    set({ isTanpuraEnabled: active });
  },

  setSoundVolume: (soundVolume) => {
    sound.init();
    vedicSound.init();
    sound.setVolume(soundVolume);
    vedicSound.setVolume(soundVolume);
    set({ soundVolume, isSoundMuted: soundVolume === 0 });
  },

  toggleScreenShake: () => {
    set((state) => ({ isScreenShakeEnabled: !state.isScreenShakeEnabled }));
  },

  toggleTutorial: () => {
    set((state) => ({ isTutorialOpen: !state.isTutorialOpen }));
  },

  setExecutionMode: (executionMode) => {
    set({ executionMode });
  },

  resetMockData: () => {
    set({
      emails: generateMockEmails(),
      files: generateMockFiles(),
      expenses: generateMockExpenses(),
      codeIssues: generateMockCodeIssues(),
      transactions: [],
      stats: {
        score: 0,
        combo: 0,
        maxCombo: 0,
        megabytesFreed: 0,
        itemsProcessed: 0,
        secondsSaved: 0,
        dollarsAudited: 0,
        codeSmellsPurged: 0,
        karmaPoints: 0,
        kleshasCleansed: 0,
        megabytesPurified: 0,
        tapasyaMultiplier: 1,
      },
    });
  },

  recordTransaction: (txData) => {
    const isDestructive = txData.actionType === 'TRASH_EMAIL' || txData.actionType === 'DELETE_FILE';
    const newTx: ChoreTransaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      status: isDestructive ? 'yamaloka_staged' : 'executed',
      stagedUntil: isDestructive ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined,
      executionMode: get().executionMode,
    };

    set((state) => {
      const mb = txData.megabytesFreed || 0;
      const sec = txData.reclaimedSeconds || 30;
      const dollars = txData.monetaryValue || 0;
      const isCode = txData.moduleId === 'vritra-vyuha' || txData.moduleId === 'glitch-exterminator';
      const smells = isCode ? 1 : 0;
      const punya = txData.punyaGained || 50;

      return {
        transactions: [newTx, ...state.transactions],
        offlineYajnaBuffer: [newTx, ...state.offlineYajnaBuffer].slice(0, 50),
        stats: {
          ...state.stats,
          megabytesFreed: Number((state.stats.megabytesFreed + mb).toFixed(2)),
          secondsSaved: state.stats.secondsSaved + sec,
          dollarsAudited: Number((state.stats.dollarsAudited + dollars).toFixed(2)),
          codeSmellsPurged: state.stats.codeSmellsPurged + smells,
          itemsProcessed: state.stats.itemsProcessed + 1,
          karmaPoints: state.stats.karmaPoints + punya,
          kleshasCleansed: state.stats.kleshasCleansed + 1,
          megabytesPurified: Number((state.stats.megabytesPurified + mb).toFixed(2)),
        },
      };
    });

    return newTx;
  },

  flushYajnaBuffer: () => {
    vedicSound.init();
    vedicSound.playTempleBell(1.5, 3.0);
    vedicSound.playPunyaChime();
    set((state) => ({
      offlineYajnaBuffer: [],
      transactions: state.transactions.map((t) =>
        t.status === 'in_flight' ? { ...t, status: 'executed' } : t
      ),
    }));
  },

  restoreFromYamaloka: (transactionId: string) => {
    get().undoTransaction(transactionId);
  },

  permanentPurgeFromYamaloka: (transactionId: string) => {
    vedicSound.init();
    vedicSound.playBrahmastraPurge();
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === transactionId ? { ...t, status: 'executed', stagedUntil: undefined } : t
      ),
    }));
  },

  undoTransaction: (transactionId: string) => {
    sound.init();
    vedicSound.init();
    vedicSound.playTempleBell(0.9, 2.5);

    const tx = get().transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status === 'undone') return;

    // Rollback artifact state based on module and targetId
    if (tx.moduleId === 'agni-pariksha' || tx.moduleId === 'nebula-purge') {
      set((state) => ({
        emails: state.emails.map((e) => (e.id === tx.targetId ? { ...e, status: tx.originalState.status } : e)),
      }));
    } else if (tx.moduleId === 'mandara-sifter' || tx.moduleId === 'gravity-sifter') {
      set((state) => ({
        files: state.files.map((f) =>
          f.id === tx.targetId
            ? { ...f, status: tx.originalState.status, currentPath: tx.originalState.currentPath }
            : f
        ),
      }));
    } else if (tx.moduleId === 'chitragupta-ledger' || tx.moduleId === 'neon-audit') {
      set((state) => ({
        expenses: state.expenses.map((exp) =>
          exp.id === tx.targetId
            ? { ...exp, status: tx.originalState.status, assignedCategory: tx.originalState.assignedCategory }
            : exp
        ),
      }));
    } else if (tx.moduleId === 'vritra-vyuha' || tx.moduleId === 'glitch-exterminator') {
      set((state) => ({
        codeIssues: state.codeIssues.map((c) => (c.id === tx.targetId ? { ...c, status: tx.originalState.status } : c)),
      }));
    }

    // Mark transaction as undone and reverse stats
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === transactionId ? { ...t, status: 'undone' } : t)),
      stats: {
        ...state.stats,
        megabytesFreed: Math.max(0, Number((state.stats.megabytesFreed - (tx.megabytesFreed || 0)).toFixed(2))),
        secondsSaved: Math.max(0, state.stats.secondsSaved - (tx.reclaimedSeconds || 30)),
        dollarsAudited: Math.max(0, Number((state.stats.dollarsAudited - (tx.monetaryValue || 0)).toFixed(2))),
        codeSmellsPurged: Math.max(0, state.stats.codeSmellsPurged - ((tx.moduleId === 'vritra-vyuha' || tx.moduleId === 'glitch-exterminator') ? 1 : 0)),
        itemsProcessed: Math.max(0, state.stats.itemsProcessed - 1),
        kleshasCleansed: Math.max(0, state.stats.kleshasCleansed - 1),
        karmaPoints: Math.max(0, state.stats.karmaPoints - (tx.punyaGained || 50)),
        megabytesPurified: Math.max(0, Number((state.stats.megabytesPurified - (tx.megabytesFreed || 0)).toFixed(2))),
      },
    }));
  },

  undoAllTransactions: () => {
    sound.init();
    vedicSound.init();
    vedicSound.playTempleBell(0.7, 4.0);

    // Revert all modified items back to original default state
    const originalEmails = generateMockEmails();
    const originalFiles = generateMockFiles();
    const originalExpenses = generateMockExpenses();
    const originalCode = generateMockCodeIssues();

    set((state) => ({
      emails: originalEmails,
      files: originalFiles,
      expenses: originalExpenses,
      codeIssues: originalCode,
      transactions: state.transactions.map((t) => ({ ...t, status: 'undone' })),
      stats: {
        ...state.stats,
        megabytesFreed: 0,
        itemsProcessed: 0,
        secondsSaved: 0,
        dollarsAudited: 0,
        codeSmellsPurged: 0,
        karmaPoints: 0,
        kleshasCleansed: 0,
        megabytesPurified: 0,
      },
    }));
  },

  // Module 1 (Agni Pariksha): Email Chore Actions
  addCustomEmail: (data) => {
    vedicSound.init();
    vedicSound.playTempleBell(1.4, 2.0);
    vedicSound.playPunyaChime();

    const newEmail: EmailArtifact = {
      id: `custom-email-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: data.sender.trim() || 'Custom Sender',
      senderEmail: data.senderEmail?.trim() || `${data.sender.toLowerCase().replace(/\s+/g, '')}@custom.com`,
      subject: data.subject.trim() || 'Custom Email Clutter',
      preview: data.preview?.trim() || 'Custom added email waiting to be cleansed in Agni Pariksha...',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sizeKb: data.sizeKb || 45,
      type: data.type,
      status: 'unread',
      isVip: !!data.isVip,
      vipReason: data.isVip ? 'Marked as VIP (Protected by Kavacha)' : undefined,
      kavachaActive: !!data.isVip,
    };

    set((state) => ({
      emails: [newEmail, ...state.emails],
    }));

    return newEmail;
  },

  trashEmail: (emailId: string) => {
    const email = get().emails.find((e) => e.id === emailId);
    if (!email || email.status === 'trashed') return;

    // Golden Kavacha VIP Protection: Immune to weapons!
    if (email.isVip || email.kavachaActive) {
      vedicSound.init();
      vedicSound.playTempleBell(2.2, 2.5); // High celestial bell deflection
      return;
    }

    const originalState = { status: email.status };
    const mb = Number((email.sizeKb / 1024).toFixed(3));

    set((state) => ({
      emails: state.emails.map((e) => (e.id === emailId ? { ...e, status: 'trashed' } : e)),
    }));

    // Live Gmail physical trash execution if connected
    const token = get().gmailAccessToken;
    if (token && email.id.startsWith('gmail-')) {
      trashGmailMessage(token, email.id).catch(() => {});
    }

    get().recordTransaction({
      moduleId: 'agni-pariksha',
      actionType: 'TRASH_EMAIL',
      title: 'आग्नेयास्त्र भस्मम्: Spam Raven Purged',
      description: `Vaporized "${email.subject.slice(0, 40)}..." from ${email.sender} into sacred ash.`,
      targetId: email.id,
      targetName: email.subject,
      originalState,
      newState: { status: 'trashed' },
      megabytesFreed: mb,
      reclaimedSeconds: 45,
      punyaGained: 40,
    });
  },

  unsubscribeEmail: (emailId: string) => {
    const email = get().emails.find((e) => e.id === emailId);
    if (!email || email.status === 'archived') return;

    const originalState = { status: email.status };
    const mb = Number((email.sizeKb / 1024).toFixed(3));

    set((state) => ({
      emails: state.emails.map((e) => (e.id === emailId ? { ...e, status: 'archived' } : e)),
    }));

    get().recordTransaction({
      moduleId: 'agni-pariksha',
      actionType: 'UNSUBSCRIBE_AND_ARCHIVE',
      title: 'वायव्य अस्त्र: Unsubscribed Newsletter Locust',
      description: `Severed karmic tether to ${email.senderEmail} and banished from sacred inbox.`,
      targetId: email.id,
      targetName: email.sender,
      originalState,
      newState: { status: 'archived' },
      megabytesFreed: mb,
      reclaimedSeconds: 120,
      punyaGained: 65,
    });
  },

  archiveReceiptEmail: (emailId: string) => {
    const email = get().emails.find((e) => e.id === emailId);
    if (!email || email.status === 'receipt_filed') return;

    const originalState = { status: email.status };
    const mb = Number((email.sizeKb / 1024).toFixed(3));

    set((state) => ({
      emails: state.emails.map((e) => (e.id === emailId ? { ...e, status: 'receipt_filed' } : e)),
    }));

    get().recordTransaction({
      moduleId: 'agni-pariksha',
      actionType: 'TAG_AND_ARCHIVE',
      title: 'स्वर्ण कपोत: Carrier Pigeon Invoice Filed',
      description: `Captured golden invoice from "${email.subject}" and archived to Tax Treasury.`,
      targetId: email.id,
      targetName: email.subject,
      originalState,
      newState: { status: 'receipt_filed' },
      megabytesFreed: mb,
      reclaimedSeconds: 90,
      punyaGained: 55,
    });
  },

  bulkNukeEmails: (count: number) => {
    const unreadSpam = get().emails.filter((e) => e.status === 'unread');
    const toNuke = unreadSpam.slice(0, count);
    if (toNuke.length === 0) return;

    const nukeIds = new Set(toNuke.map((e) => e.id));
    let totalKb = 0;
    toNuke.forEach((e) => (totalKb += e.sizeKb));
    const mb = Number((totalKb / 1024).toFixed(2));

    set((state) => ({
      emails: state.emails.map((e) => (nukeIds.has(e.id) ? { ...e, status: 'trashed' } : e)),
    }));

    get().recordTransaction({
      moduleId: 'agni-pariksha',
      actionType: 'BULK_NUKE_EMAILS',
      title: 'ब्रह्मास्त्र प्रहार: Kumbhakarna Backlog Nuked',
      description: `Disintegrated ${toNuke.length} stale unread emails in a single divine flame strike!`,
      targetId: 'bulk-backlog-cluster',
      targetName: `Batch of ${toNuke.length} Stale Backlog Emails`,
      originalState: { count: toNuke.length },
      newState: { status: 'bulk_trashed' },
      megabytesFreed: mb,
      reclaimedSeconds: count * 45,
      punyaGained: count * 35,
    });
  },

  // Module 2 (Mandara Sifter): File Chore Actions
  moveFile: (fileId, destinationFolder, category) => {
    const file = get().files.find((f) => f.id === fileId);
    if (!file) return;

    const originalState = { status: file.status, currentPath: file.currentPath };
    const newPath = `${destinationFolder}/${file.name}`;
    const mb = Number((file.sizeBytes / (1024 * 1024)).toFixed(2));

    const statusMap = {
      pdf: 'in_documents',
      screenshot: 'in_pictures',
      installer: 'trashed',
      archive: 'compressed',
      messy_temp: 'trashed',
    } as const;

    const newStatus = statusMap[category] || 'in_documents';

    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, status: newStatus, currentPath: newPath } : f)),
    }));

    get().recordTransaction({
      moduleId: 'mandara-sifter',
      actionType: 'MOVE_FILE',
      title: 'मन्दरा मन्थन: Sacred Relocation',
      description: `Churned "${file.name}" out of Downloads into ${destinationFolder}.`,
      targetId: file.id,
      targetName: file.name,
      originalState,
      newState: { status: newStatus, currentPath: newPath },
      megabytesFreed: mb,
      reclaimedSeconds: 40,
      punyaGained: 45,
    });
  },

  deleteFile: (fileId) => {
    const file = get().files.find((f) => f.id === fileId);
    if (!file) return;

    // Golden Kavacha VIP Protection: Sensitive files cannot be burned!
    if (file.isVip || file.kavachaActive) {
      vedicSound.init();
      vedicSound.playTempleBell(2.2, 2.5); // High celestial bell deflection
      return;
    }

    const originalState = { status: file.status, currentPath: file.currentPath };
    const mb = Number((file.sizeBytes / (1024 * 1024)).toFixed(2));

    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, status: 'trashed', currentPath: '~/.Trash' } : f)),
    }));

    get().recordTransaction({
      moduleId: 'mandara-sifter',
      actionType: 'DELETE_FILE',
      title: 'हवन कुण्ड: Incinerated Junk File',
      description: `Consumed temporary installer/cache "${file.name}" in the sacred pyre (~/.Trash).`,
      targetId: file.id,
      targetName: file.name,
      originalState,
      newState: { status: 'trashed' },
      megabytesFreed: mb,
      reclaimedSeconds: 25,
      punyaGained: 30,
    });
  },

  compressFile: (fileId) => {
    const file = get().files.find((f) => f.id === fileId);
    if (!file) return;

    const originalState = { status: file.status, currentPath: file.currentPath };
    const mb = Number(((file.sizeBytes * 0.45) / (1024 * 1024)).toFixed(2));

    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, status: 'compressed', currentPath: '/Archives/Batch_2026.zip' } : f)),
    }));

    get().recordTransaction({
      moduleId: 'mandara-sifter',
      actionType: 'COMPRESS_FILES',
      title: 'संग्रह शिला: Meru Stone Archive',
      description: `Encapsulated "${file.name}" into compressed LZFSE zip repository.`,
      targetId: file.id,
      targetName: file.name,
      originalState,
      newState: { status: 'compressed' },
      megabytesFreed: mb,
      reclaimedSeconds: 50,
      punyaGained: 50,
    });
  },

  // Module 3 (Chitragupta's Ledger): Expense Chore Actions
  approveBusinessExpense: (expenseId) => {
    const exp = get().expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    const originalState = { status: exp.status, assignedCategory: exp.assignedCategory };

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === expenseId ? { ...e, status: 'business_approved', assignedCategory: e.suggestedCategory } : e
      ),
    }));

    get().recordTransaction({
      moduleId: 'chitragupta-ledger',
      actionType: 'APPROVE_BUSINESS_EXPENSE',
      title: 'धर्म लेखा: Dharma Business Expense Verified',
      description: `Approved $${exp.amount.toFixed(2)} from ${exp.merchant} under tax category [${exp.suggestedCategory}].`,
      targetId: exp.id,
      targetName: exp.merchant,
      originalState,
      newState: { status: 'business_approved', assignedCategory: exp.suggestedCategory },
      monetaryValue: exp.amount,
      reclaimedSeconds: 90,
      punyaGained: 60,
    });
  },

  flagPersonalExpense: (expenseId) => {
    const exp = get().expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    const originalState = { status: exp.status, assignedCategory: exp.assignedCategory };

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === expenseId ? { ...e, status: 'personal_flagged', assignedCategory: 'Personal Non-Deductible' } : e
      ),
    }));

    get().recordTransaction({
      moduleId: 'chitragupta-ledger',
      actionType: 'FLAG_PERSONAL_EXPENSE',
      title: 'काम / मोह: Personal Expense Flagged',
      description: `Segregated $${exp.amount.toFixed(2)} at ${exp.merchant} from business accounts.`,
      targetId: exp.id,
      targetName: exp.merchant,
      originalState,
      newState: { status: 'personal_flagged', assignedCategory: 'Personal Non-Deductible' },
      monetaryValue: exp.amount,
      reclaimedSeconds: 60,
      punyaGained: 35,
    });
  },

  disputeExpense: (expenseId) => {
    const exp = get().expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    const originalState = { status: exp.status, assignedCategory: exp.assignedCategory };

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === expenseId ? { ...e, status: 'disputed', assignedCategory: 'Chargeback Investigation' } : e
      ),
    }));

    get().recordTransaction({
      moduleId: 'chitragupta-ledger',
      actionType: 'DISPUTE_EXPENSE',
      title: 'विवाद: Disputed / Ticket Raised',
      description: `Flagged fraudulent or unverified charge of $${exp.amount.toFixed(2)} at ${exp.merchant}.`,
      targetId: exp.id,
      targetName: exp.merchant,
      originalState,
      newState: { status: 'disputed' },
      monetaryValue: exp.amount,
      reclaimedSeconds: 150,
      punyaGained: 75,
    });
  },

  // Module 4 (Vritra's Vyuha): Code Smells Chore Actions
  fixCodeIssue: (issueId) => {
    const issue = get().codeIssues.find((c) => c.id === issueId);
    if (!issue) return;

    const originalState = { status: issue.status };

    set((state) => ({
      codeIssues: state.codeIssues.map((c) => (c.id === issueId ? { ...c, status: 'fixed' } : c)),
    }));

    get().recordTransaction({
      moduleId: 'vritra-vyuha',
      actionType: 'APPLY_LINT_FIX',
      title: 'ऋत शुद्धि: AST Code Smell Purged',
      description: `Banished ${issue.issueType} on line ${issue.line} in ${issue.filePath}.`,
      targetId: issue.id,
      targetName: `${issue.filePath}:${issue.line}`,
      originalState,
      newState: { status: 'fixed' },
      reclaimedSeconds: 45,
      punyaGained: 50,
    });
  },

  // Combo & Score Actions
  addScore: (points: number) => {
    set((state) => ({
      stats: {
        ...state.stats,
        score: state.stats.score + points,
        karmaPoints: state.stats.karmaPoints + points,
      },
    }));
  },

  incrementCombo: () => {
    set((state) => {
      const nextCombo = state.stats.combo + 1;
      return {
        stats: {
          ...state.stats,
          combo: nextCombo,
          maxCombo: Math.max(state.stats.maxCombo, nextCombo),
          tapasyaMultiplier: Math.min(5, 1 + Math.floor(nextCombo / 3)),
        },
      };
    });
  },

  resetCombo: () => {
    set((state) => ({
      stats: {
        ...state.stats,
        combo: 0,
        tapasyaMultiplier: 1,
      },
    }));
  },
}));
