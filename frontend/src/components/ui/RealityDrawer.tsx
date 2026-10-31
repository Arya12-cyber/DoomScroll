import React, { useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Trash2,
  Move,
  FileCode,
  Archive,
  DollarSign,
  History,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ChoreModuleId, TransactionActionType } from '../../types';

export const RealityDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    toggleRealityDrawer,
    transactions,
    offlineYajnaBuffer,
    flushYajnaBuffer,
    undoTransaction,
    undoAllTransactions,
    restoreFromYamaloka,
    permanentPurgeFromYamaloka,
    executionMode,
    stats,
  } = useTransactionStore();

  const [activeTab, setActiveTab] = useState<'ledger' | 'yamaloka' | 'yajna'>('ledger');
  const [filterModule, setFilterModule] = useState<'all' | ChoreModuleId>('all');

  const yamalokaItems = transactions.filter(
    (t) => t.status === 'yamaloka_staged' || (t.stagedUntil && t.status !== 'undone')
  );

  const filteredTransactions = transactions.filter(
    (t) => filterModule === 'all' || t.moduleId === filterModule
  );

  const getActionIcon = (action: TransactionActionType) => {
    switch (action) {
      case 'TRASH_EMAIL':
      case 'DELETE_FILE':
        return <Trash2 className="w-3.5 h-3.5 text-red-400" />;
      case 'MOVE_FILE':
        return <Move className="w-3.5 h-3.5 text-sky-400" />;
      case 'UNSUBSCRIBE_AND_ARCHIVE':
      case 'TAG_AND_ARCHIVE':
      case 'TAG_RECEIPT':
      case 'COMPRESS_FILES':
        return <Archive className="w-3.5 h-3.5 text-purple-400" />;
      case 'APPROVE_BUSINESS_EXPENSE':
      case 'FLAG_PERSONAL_EXPENSE':
      case 'DISPUTE_EXPENSE':
        return <DollarSign className="w-3.5 h-3.5 text-vedic-gold-bright" />;
      case 'APPLY_LINT_FIX':
      case 'INSERT_SEMICOLON':
      case 'STRIP_CONSOLE_LOG':
      case 'REMOVE_UNUSED_IMPORT':
        return <FileCode className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <History className="w-3.5 h-3.5 text-vedic-gold-bright" />;
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 font-sans shadow-2xl ${
        isDrawerOpen ? 'h-80' : 'h-11'
      } bg-[#0e111a] border-t-2 border-vedic-gold/60 text-[#ede5d5] jaali-texture`}
    >
      {/* Drawer Grip / Bar Header */}
      <div
        onClick={toggleRealityDrawer}
        className="h-11 px-6 flex items-center justify-between cursor-pointer hover:bg-vedic-gold/10 transition-colors select-none border-b border-vedic-gold/20"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-vedic-gold-bright font-bold text-xs tracking-wider font-devanagari">
            <Sparkles className="w-4 h-4 text-vedic-gold" />
            <span>प्रत्याहार // PRATYAHARA SAFETY VAULT</span>
          </div>

          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40 font-bold">
            {transactions.length} Actions
          </span>

          {/* Yamaloka Quarantine Staging Badge */}
          {yamalokaItems.length > 0 && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/60 font-bold flex items-center gap-1">
              <span>⚖️ यमलोक:</span>
              <strong>{yamalokaItems.length} Staged</strong>
            </span>
          )}

          {/* Offline Yajna Buffer In-Flight Badge */}
          {offlineYajnaBuffer.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                flushYajnaBuffer();
              }}
              className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/60 font-bold flex items-center gap-1 animate-pulse"
              title="Click to flush all in-flight offerings to cloud"
            >
              <span>🔥 यज्ञ संचरण:</span>
              <strong>{offlineYajnaBuffer.length} In-Flight</strong>
            </button>
          )}

          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#181b26] text-[#cbbda3] border border-[#373c52]">
            {executionMode.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-devanagari">
          <div className="hidden sm:flex items-center gap-4 text-[#cbbda3] text-[11px]">
            <span>पुण्य: <strong className="gold-gradient-text">{stats.karmaPoints}</strong></span>
            <span>शुद्धीकृत: <strong className="text-emerald-400">{stats.megabytesPurified} MB</strong></span>
            <span>क्लेश मुक्ति: <strong className="text-red-400">{stats.kleshasCleansed}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-vedic-gold-bright text-xs font-bold">
            <span>{isDrawerOpen ? 'संकोच (Collapse)' : 'निरीक्षण (Inspect Ledger)'}</span>
            {isDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Drawer Expanded Content */}
      {isDrawerOpen && (
        <div className="h-[calc(100%-44px)] flex flex-col justify-between p-4 bg-[#0a0c14]/95">
          {/* Top Tabs & Global Controls */}
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-vedic-gold/20 gap-3 text-xs">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 rounded-xl font-devanagari font-bold text-xs transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold shadow-sm'
                    : 'text-[#cbbda3] hover:text-white bg-[#181b26] border border-[#373c52]'
                }`}
              >
                📜 प्रत्याहार लेज़र ({transactions.length})
              </button>

              <button
                onClick={() => setActiveTab('yamaloka')}
                className={`px-3 py-1.5 rounded-xl font-devanagari font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeTab === 'yamaloka'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500 shadow-sm'
                    : 'text-[#cbbda3] hover:text-white bg-[#181b26] border border-[#373c52]'
                }`}
              >
                <span>⚖️ यमलोक (30-Day Staging Vault)</span>
                {yamalokaItems.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full text-[10px]">
                    {yamalokaItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('yajna')}
                className={`px-3 py-1.5 rounded-xl font-devanagari font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeTab === 'yajna'
                    ? 'bg-sky-950/80 text-sky-300 border border-sky-500 shadow-sm'
                    : 'text-[#cbbda3] hover:text-white bg-[#181b26] border border-[#373c52]'
                }`}
              >
                <span>🔥 यज्ञ बफर (In-Flight Offerings)</span>
                {offlineYajnaBuffer.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 rounded-full text-[10px]">
                    {offlineYajnaBuffer.length}
                  </span>
                )}
              </button>
            </div>

            {/* Actions for active tab */}
            {activeTab === 'ledger' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {(['all', 'agni-pariksha', 'mandara-sifter', 'chitragupta-ledger', 'vritra-vyuha'] as const).map(
                    (mod) => (
                      <button
                        key={mod}
                        onClick={() => setFilterModule(mod)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-devanagari transition-all ${
                          filterModule === mod
                            ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold'
                            : 'text-[#cbbda3] hover:text-white bg-[#181b26] border border-[#373c52]'
                        }`}
                      >
                        {mod === 'all'
                          ? 'सर्व'
                          : mod === 'agni-pariksha'
                          ? 'अग्नि'
                          : mod === 'mandara-sifter'
                          ? 'मन्दरा'
                          : mod === 'chitragupta-ledger'
                          ? 'चित्रगुप्त'
                          : 'वृत्र'}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={undoAllTransactions}
                  disabled={transactions.every((t) => t.status === 'undone')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 rounded-xl font-devanagari font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Revert All Actions Safely Back to Original State"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>महा प्रत्याहार (Global Rewind)</span>
                </button>
              </div>
            )}

            {activeTab === 'yajna' && (
              <button
                onClick={flushYajnaBuffer}
                disabled={offlineYajnaBuffer.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/60 text-sky-200 rounded-xl font-devanagari font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-40"
              >
                <span>हवि समर्पण (Flush & Commit to Cloud)</span>
              </button>
            )}
          </div>

          {/* Active Tab Body Content */}
          <div className="flex-1 overflow-y-auto my-2 space-y-2 pr-2">
            {activeTab === 'ledger' && (
              filteredTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <ShieldCheck className="w-10 h-10 text-vedic-gold/40 mb-2" />
                  <p className="text-sm font-devanagari text-[#cbbda3]">नो क्लेश (No Physical Chores Executed Yet)</p>
                  <p className="text-xs text-slate-500 font-serif">Play any trial to begin purifying digital karma.</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                      tx.status === 'undone'
                        ? 'bg-[#12141d]/50 border-slate-800/60 opacity-50 line-through'
                        : 'bg-[#151926] border-vedic-gold/30 hover:border-vedic-gold/60 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#080a14] border border-vedic-gold/30">
                        {getActionIcon(tx.actionType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-devanagari">{tx.title}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#080a14] text-[#cbbda3] border border-vedic-gold/20 font-mono">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </span>
                          {tx.status === 'yamaloka_staged' && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-bold font-devanagari">
                              यमलोक ३०-दिवस
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#cbbda3] font-serif truncate max-w-xl">
                          {tx.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {tx.status === 'undone' ? (
                        <span className="text-[11px] text-red-400 font-devanagari font-bold">प्रत्याहृतम् (Undone)</span>
                      ) : (
                        <button
                          onClick={() => undoTransaction(tx.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-vedic-gold/20 hover:bg-vedic-gold/30 border border-vedic-gold text-vedic-gold-bright rounded-xl font-devanagari text-xs font-bold transition-all active:scale-95"
                          title="Revert this action safely"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>प्रत्याहार (Undo)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'yamaloka' && (
              yamalokaItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-devanagari">
                  <ShieldCheck className="w-10 h-10 text-amber-400/40 mb-2" />
                  <p className="text-sm text-amber-300 font-bold">यमलोक रिक्तम् // Yamaloka Staging Vault Empty</p>
                  <p className="text-xs text-[#cbbda3] font-serif mt-1">
                    No files or emails currently staged. Destructive deletions rest in this 30-day staging purgatory before permanent purge.
                  </p>
                </div>
              ) : (
                yamalokaItems.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl border text-xs flex items-center justify-between transition-all bg-[#171318] border-amber-600/40 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-200 font-devanagari">{tx.title}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-700 font-mono">
                            30-Day Staged Purgatory
                          </span>
                        </div>
                        <p className="text-[11px] text-[#cbbda3] font-serif truncate max-w-xl">
                          Target: {tx.targetName} • {tx.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restoreFromYamaloka(tx.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-200 rounded-xl font-devanagari text-xs font-bold transition-all active:scale-95"
                        title="Restore item immediately"
                      >
                        <span>प्रत्यावर्तन (Restore)</span>
                      </button>
                      <button
                        onClick={() => permanentPurgeFromYamaloka(tx.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 rounded-xl font-devanagari text-xs font-bold transition-all active:scale-95"
                        title="Permanently incinerate"
                      >
                        <span>अग्नि भस्म (Permanent Purge)</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'yajna' && (
              offlineYajnaBuffer.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-devanagari">
                  <Sparkles className="w-10 h-10 text-sky-400/40 mb-2" />
                  <p className="text-sm text-sky-300 font-bold">सर्व हवि समर्पितम् // All Yajna Offerings Committed</p>
                  <p className="text-xs text-[#cbbda3] font-serif mt-1">
                    Optimistic queue is empty. Background ledger is in perfect synchronization with physical cloud stores.
                  </p>
                </div>
              ) : (
                offlineYajnaBuffer.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl border text-xs flex items-center justify-between transition-all bg-[#0d1422] border-sky-600/40 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sky-200 font-devanagari">{tx.title}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-sky-950 text-sky-300 border border-sky-700 font-mono">
                            In-Flight Queue
                          </span>
                        </div>
                        <p className="text-[11px] text-[#cbbda3] font-serif truncate max-w-xl">
                          {tx.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-1 rounded-xl bg-sky-950 text-sky-300 border border-sky-600/60 font-mono font-bold animate-pulse">
                      OPTIMISTIC SYNCING...
                    </span>
                  </div>
                ))
              )
            )}
          </div>

          {/* Safety Notice Footer */}
          <div className="pt-2 border-t border-vedic-gold/20 flex items-center justify-between text-[11px] text-[#a89980] font-serif">
            <span>
              🔒 <strong>Karmic Safety Net:</strong> Every on-screen hit physically updates the transaction ledger with instant rollback.
            </span>
            <span className="font-devanagari text-vedic-gold-bright">चित्तशुद्धिः परमो धर्मः</span>
          </div>
        </div>
      )}
    </div>
  );
};
