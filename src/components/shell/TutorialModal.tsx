import React, { useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import {
  HelpCircle,
  X,
  Mail,
  Folder,
  DollarSign,
  Terminal,
  RotateCcw,
  Eye,
  CheckCircle,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const TutorialModal: React.FC = () => {
  const { isTutorialOpen, toggleTutorial, setActiveModule } = useTransactionStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'files' | 'expenses' | 'code'>('overview');

  if (!isTutorialOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-[#ede5d5] select-none animate-in fade-in zoom-in-95 duration-200 jaali-texture">
      <div className="w-full max-w-2xl bg-[#121522] border-2 border-vedic-gold rounded-3xl p-6 shadow-vedic-gold flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-vedic-gold/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-vedic-gold/15 text-vedic-gold-bright border border-vedic-gold/40">
              <BookOpen className="w-5 h-5 text-vedic-gold" />
            </div>
            <div>
              <h2 className="text-base font-devanagari font-black text-white tracking-wide">
                कर्मयोगी शास्त्र // THE SACRED FIELD MANUAL
              </h2>
              <p className="text-[11px] text-[#cbbda3] font-serif">
                Transmuting digital afflictions (क्लेश) into peace of mind (चित्तशुद्धि)
              </p>
            </div>
          </div>
          <button
            onClick={toggleTutorial}
            className="p-1.5 text-[#cbbda3] hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 my-3 border-b border-vedic-gold/20 pb-2 text-xs overflow-x-auto font-devanagari">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold shadow-sm'
                : 'text-[#cbbda3] hover:text-white'
            }`}
          >
            सिद्धान्त (Concept)
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'inbox'
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold shadow-sm'
                : 'text-[#cbbda3] hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>अग्नि परीक्षा (Inbox)</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'files'
                ? 'bg-sky-500/25 text-sky-300 border border-sky-400 shadow-sm'
                : 'text-[#cbbda3] hover:text-white'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>मन्दरा मंथन (Files)</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400 shadow-sm'
                : 'text-[#cbbda3] hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>चित्रगुप्त लेखा (Audit)</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-red-500/25 text-red-300 border border-red-400 shadow-sm'
                : 'text-[#cbbda3] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>वृत्र व्यूह (Lint)</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto pr-2 text-xs leading-relaxed space-y-4 font-serif">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="bg-[#0a0d16] p-4 rounded-2xl border border-vedic-gold/40">
                <h3 className="text-sm font-bold text-vedic-gold-bright font-devanagari mb-1">
                  द्वैत इंजन दर्शन: क्रिया और कर्मफल (The Dual-Engine Reality)
                </h3>
                <p className="text-[#cbbda3]">
                  Digital chores are modern <em>Kleshas</em> (mental afflictions). When you play high-octane mythical arcade trials in the foreground, you are physically purifying your real-world inbox, downloads, receipts, and source code in the background!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-[#0a0d16] p-3 rounded-2xl border border-vedic-gold/20">
                  <span className="font-devanagari font-bold text-white block mb-1">प्रत्यक्ष दर्शन [Tab]</span>
                  <p className="text-[#cbbda3]">
                    Press <code className="text-vedic-gold-bright font-bold">[Tab]</code> at any moment to reveal the real-world clean desk view.
                  </p>
                </div>
                <div className="bg-[#0a0d16] p-3 rounded-2xl border border-vedic-gold/20">
                  <span className="font-devanagari font-bold text-white block mb-1">प्रत्याहार (Time-Machine Undo)</span>
                  <p className="text-[#cbbda3]">
                    Every on-screen action is logged atomically. Revert single actions or trigger a global rewind safely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-vedic-gold-bright font-devanagari">
                अग्नि परीक्षा (Agni Pariksha — Inbox Zero)
              </h3>
              <ul className="space-y-2 text-[#cbbda3]">
                <li>• <strong>काकासुर (Spam Ravens):</strong> Fire Agneyastra arrows to call <code className="text-red-400">TRASH_EMAIL</code>.</li>
                <li>• <strong>शलभ (Newsletter Locusts):</strong> Launch Vayavyastra wind arrows to execute <code className="text-sky-300">UNSUBSCRIBE_AND_ARCHIVE</code>.</li>
                <li>• <strong>स्वर्ण कपोत (Invoice Pigeons):</strong> Cast Varunapasha silk net to call <code className="text-vedic-gold-bright">TAG_RECEIPT</code>.</li>
                <li>• <strong>कुम्भकर्ण महादूत (Boss Backlog):</strong> Slumbering titan representing 2,000 unread emails; chipping health bulk-nukes 50 emails at a time.</li>
              </ul>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-sky-300 font-devanagari">
                मन्दरा मंथन (Mandara Sifter — Downloads Clutter)
              </h3>
              <ul className="space-y-2 text-[#cbbda3]">
                <li>• <strong>Slingshot Fling:</strong> Left drag & release to catapult chaotic scrolls and plates into matching sanctums.</li>
                <li>• <strong>Vayu Wind Pads [M]:</strong> Magnetic attractor currents guide files to their destinations.</li>
                <li>• <strong>Current Flip [G]:</strong> Invert gravity upward.</li>
                <li>• <strong>Suika Merge:</strong> Slam duplicate files together to compress them into .zip archives.</li>
              </ul>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-300 font-devanagari">
                चित्रगुप्त लेखा (Chitragupta's Ledger — Expense Audit)
              </h3>
              <ul className="space-y-2 text-[#cbbda3]">
                <li>• <strong>Swipe Right [D]:</strong> धर्म (Dharma) — Verified business deductible expense.</li>
                <li>• <strong>Swipe Left [A]:</strong> काम / मोह (Moha) — Flagged as personal expense.</li>
                <li>• <strong>Swipe Up [W]:</strong> विवाद (Vivada) — Disputed or split charge ticket.</li>
                <li>• <strong>Rhythm Highway:</strong> Maintain 120 BPM Mridangam timing for <em>शुद्ध समय! x2</em> Punya multiplier.</li>
              </ul>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-red-400 font-devanagari">
                वृत्र व्यूह (Vritra's Vyuha — AST Lint Rogue-lite)
              </h3>
              <ul className="space-y-2 text-[#cbbda3]">
                <li>• <strong>Khanda Slash [Space]:</strong> Slashes semicolon scorpions and goblins to trigger AST patch fixes.</li>
                <li>• <strong>Sudarshana Chakra [Q/E]:</strong> 3-way spinning discs slicing through bug clusters.</li>
                <li>• <strong>Gayatri Cleanse [R]:</strong> 100% charged ultimate formatting all files repo-wide with Prettier!</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-vedic-gold/20 flex items-center justify-between text-xs">
          <span className="font-devanagari text-vedic-gold-bright">चित्तशुद्धिः परमो धर्मः</span>
          <button
            onClick={toggleTutorial}
            className="px-4 py-1.5 bg-vedic-gold hover:bg-vedic-gold-bright text-slate-950 font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            साधु! (Understood)
          </button>
        </div>
      </div>
    </div>
  );
};
