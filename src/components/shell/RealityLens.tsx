import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { EmailInboxView } from '../chores/EmailInboxView';
import { FileExplorerView } from '../chores/FileExplorerView';
import { ExpenseAuditView } from '../chores/ExpenseAuditView';
import { CodeDiffView } from '../chores/CodeDiffView';
import {
  Mail,
  Folder,
  DollarSign,
  Terminal,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ChoreModuleId } from '../../types';

export const RealityLens: React.FC = () => {
  const { isRealityLensOpen, toggleRealityLens, activeModule } = useTransactionStore();

  const [activeTab, setActiveTab] = useState<ChoreModuleId>('agni-pariksha');

  useEffect(() => {
    if (activeModule) {
      if (activeModule === 'nebula-purge') setActiveTab('agni-pariksha');
      else if (activeModule === 'gravity-sifter') setActiveTab('mandara-sifter');
      else if (activeModule === 'neon-audit') setActiveTab('chitragupta-ledger');
      else if (activeModule === 'glitch-exterminator') setActiveTab('vritra-vyuha');
      else setActiveTab(activeModule);
    }
  }, [activeModule]);

  if (!isRealityLensOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#090b14]/95 backdrop-blur-xl flex flex-col font-sans text-[#ede5d5] animate-in fade-in zoom-in-95 duration-200 jaali-texture">
      {/* Top Sacred Desk Navigation Bar */}
      <div className="h-16 px-6 bg-[#0f121d] border-b-2 border-vedic-gold/50 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-vedic-gold/15 text-vedic-gold-bright border border-vedic-gold/40">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-devanagari font-black tracking-wider text-vedic-gold-bright flex items-center gap-2">
              प्रत्यक्ष दर्शन // THE REALITY LENS (PHYSICAL DESK VIEW)
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 font-sans font-bold">
                PHYSICALLY SYNCHRONIZED
              </span>
            </h1>
            <p className="text-[11px] text-[#cbbda3] font-serif">
              Inspect the real inbox table, clean file system, expense balances, and live git diffs.
            </p>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex items-center gap-2 font-devanagari">
          <button
            onClick={() => setActiveTab('agni-pariksha')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'agni-pariksha' || activeTab === 'nebula-purge'
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold shadow-vedic-gold'
                : 'text-[#cbbda3] hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>अग्नि परीक्षा (Gmail)</span>
          </button>

          <button
            onClick={() => setActiveTab('mandara-sifter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mandara-sifter' || activeTab === 'gravity-sifter'
                ? 'bg-sky-500/25 text-sky-300 border border-sky-400 shadow-md'
                : 'text-[#cbbda3] hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>मन्दरा मंथन (Files)</span>
          </button>

          <button
            onClick={() => setActiveTab('chitragupta-ledger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chitragupta-ledger' || activeTab === 'neon-audit'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400 shadow-md'
                : 'text-[#cbbda3] hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>चित्रगुप्त लेखा (Expenses)</span>
          </button>

          <button
            onClick={() => setActiveTab('vritra-vyuha')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'vritra-vyuha' || activeTab === 'glitch-exterminator'
                ? 'bg-red-500/25 text-red-300 border border-red-400 shadow-md'
                : 'text-[#cbbda3] hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>वृत्र व्यूह (AST Diff)</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={toggleRealityLens}
          className="p-2 rounded-xl bg-[#181b26] hover:bg-red-950 text-[#cbbda3] hover:text-red-300 border border-[#373c52] transition-colors"
          title="Return to Sacred Trial View [Tab]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Real World Desk Views Viewport */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-[#080a14]">
        {(activeTab === 'agni-pariksha' || activeTab === 'nebula-purge') && <EmailInboxView />}
        {(activeTab === 'mandara-sifter' || activeTab === 'gravity-sifter') && <FileExplorerView />}
        {(activeTab === 'chitragupta-ledger' || activeTab === 'neon-audit') && <ExpenseAuditView />}
        {(activeTab === 'vritra-vyuha' || activeTab === 'glitch-exterminator') && <CodeDiffView />}
      </div>
    </div>
  );
};
