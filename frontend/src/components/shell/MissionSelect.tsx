import React from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { sound } from '../../lib/audio/soundEngine';
import { ChoreModuleId, ExecutionMode } from '../../types';
import {
  Gamepad2,
  Mail,
  Folder,
  DollarSign,
  Terminal,
  Zap,
  Play,
  RotateCcw,
  ShieldCheck,
  Flame,
  Award,
  Sparkles,
  Cpu,
  Layers,
} from 'lucide-react';

export const MissionSelect: React.FC = () => {
  const {
    setActiveModule,
    executionMode,
    setExecutionMode,
    resetMockData,
    stats,
    emails,
    files,
    expenses,
    codeIssues,
  } = useTransactionStore();

  const handleLaunch = (moduleId: ChoreModuleId) => {
    sound.init();
    sound.playComboUp(3);
    setActiveModule(moduleId);
  };

  const unreadEmails = emails.filter((e) => e.status === 'unread').length;
  const clutteredFiles = files.filter((f) => f.status === 'in_downloads').length;
  const pendingExpenses = expenses.filter((e) => e.status === 'pending_review').length;
  const unfixedCode = codeIssues.filter((c) => c.status === 'unfixed').length;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 font-mono overflow-y-auto select-none bg-[#090b12] text-slate-100 pb-20">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#0a0b12] to-[#050609] pointer-events-none" />

      {/* Header & Logo Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
            <Cpu className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>PUPPETEER DUAL-ENGINE ARCHITECTURE // v2.6.4</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-400 to-amber-400 tracking-wider">
            SHADOW OPERATOR
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            High-octane retro arcade gameplay in the foreground physically executes procrastinated digital chores in the background.
          </p>
        </div>

        {/* Global Statistics Ticker */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#121624] border border-cyan-500/30 px-3.5 py-2 rounded-xl text-center shadow-neon-cyan">
            <div className="text-[10px] text-slate-400">TOTAL SCORE</div>
            <div className="text-lg font-extrabold text-cyan-300">{stats.score.toLocaleString()}</div>
          </div>
          <div className="bg-[#121624] border border-magenta-500/30 px-3.5 py-2 rounded-xl text-center shadow-neon-magenta">
            <div className="text-[10px] text-slate-400">SPACE FREED</div>
            <div className="text-lg font-extrabold text-magenta-300">{stats.megabytesFreed} MB</div>
          </div>
          <div className="bg-[#121624] border border-emerald-500/30 px-3.5 py-2 rounded-xl text-center shadow-neon-matrix">
            <div className="text-[10px] text-slate-400">CHORES SLAYED</div>
            <div className="text-lg font-extrabold text-emerald-300">{stats.itemsProcessed}</div>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Quick Reset */}
      <div className="relative z-10 my-4 flex flex-wrap items-center justify-between gap-3 bg-[#0e121d] border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">EXECUTION ENGINE:</span>
          <button
            onClick={() => setExecutionMode('arcade')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              executionMode === 'arcade'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500 shadow-neon-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🕹️ Arcade Simulation (500+ Items Seeded)
          </button>
          <button
            onClick={() => setExecutionMode('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              executionMode === 'live'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500 shadow-neon-matrix'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Live Connect Mode (APIs & Filesystem)
          </button>
        </div>

        <button
          onClick={resetMockData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          title="Reseed 500+ fresh items across all chore categories"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reseed Mock Database</span>
        </button>
      </div>

      {/* 4 Arcade Cabinet Pods Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-4">
        {/* Module A: Nebula Purge */}
        <div className="group relative bg-[#0e121f] border-2 border-red-500/30 hover:border-red-500/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-neon-magenta hover:-translate-y-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                MODULE A // SPACE SHOOTER
              </span>
              <span className="text-xs text-red-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                Vampire Survivors
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white group-hover:text-red-400 transition-colors">
              NEBULA PURGE
            </h2>
            <div className="text-xs text-red-300 font-semibold mb-3">Chore: Inbox Zero</div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Vaporize spam drones, fire EMPs at newsletter cruisers, and tractor beam invoice cargo. Defeat "The 2021 Backlog" boss!
            </p>

            <div className="bg-[#080b12] border border-slate-800 p-2.5 rounded-xl mb-4 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Unread In Queue:</span>
                <span className="text-red-400 font-bold">{unreadEmails} emails</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bound Action:</span>
                <span className="text-cyan-300 font-bold">TRASH / UNSUBSCRIBE</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleLaunch('nebula-purge')}
            className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 group-hover:shadow-neon-magenta"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LAUNCH MISSION</span>
          </button>
        </div>

        {/* Module B: Gravity Sifter */}
        <div className="group relative bg-[#0e121f] border-2 border-blue-500/30 hover:border-blue-500/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-neon-cyan hover:-translate-y-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                MODULE B // 2D PHYSICS
              </span>
              <span className="text-xs text-blue-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Suika / Sorter
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white group-hover:text-blue-400 transition-colors">
              GRAVITY SIFTER
            </h2>
            <div className="text-xs text-blue-300 font-semibold mb-3">Chore: Downloads & Desktop Clutter</div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Toss, deflect, and magnetically vacuum messy screenshots, PDFs, and installers into dimensional wormholes.
            </p>

            <div className="bg-[#080b12] border border-slate-800 p-2.5 rounded-xl mb-4 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Cluttered Files:</span>
                <span className="text-amber-400 font-bold">{clutteredFiles} files</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bound Action:</span>
                <span className="text-blue-300 font-bold">ROUTE / ARCHIVE / DELETE</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleLaunch('gravity-sifter')}
            className="w-full py-2.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-500 text-blue-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 group-hover:shadow-neon-cyan"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LAUNCH MISSION</span>
          </button>
        </div>

        {/* Module C: Neon Audit */}
        <div className="group relative bg-[#0e121f] border-2 border-amber-500/30 hover:border-amber-500/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-neon-amber hover:-translate-y-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                MODULE C // RHYTHM SWIPE
              </span>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Reigns / 120 BPM
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
              NEON AUDIT
            </h2>
            <div className="text-xs text-amber-300 font-semibold mb-3">Chore: Expense Review & Tax Deductions</div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              High-speed swipe cards to synthwave beat. Swipe Right to approve business write-offs, Left for personal, Up for dispute.
            </p>

            <div className="bg-[#080b12] border border-slate-800 p-2.5 rounded-xl mb-4 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Pending Receipts:</span>
                <span className="text-amber-400 font-bold">{pendingExpenses} items</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bound Action:</span>
                <span className="text-emerald-300 font-bold">TAG TAX DEDUCTIONS</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleLaunch('neon-audit')}
            className="w-full py-2.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500 text-amber-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 group-hover:shadow-neon-amber"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LAUNCH MISSION</span>
          </button>
        </div>

        {/* Module D: Glitch Exterminator */}
        <div className="group relative bg-[#0e121f] border-2 border-matrix-green/30 hover:border-matrix-green/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-neon-matrix hover:-translate-y-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-matrix-green border border-emerald-800">
                MODULE D // ROGUE SLASHER
              </span>
              <span className="text-xs text-matrix-green font-bold flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-matrix-green" />
                AST Tree-Shaker
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white group-hover:text-matrix-green transition-colors">
              GLITCH EXTERMINATOR
            </h2>
            <div className="text-xs text-matrix-green font-semibold mb-3">Chore: Lint Errors & Code Smells</div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Slash Semicolon Scorpions, crush Unused Import Wasps, and purge Console.log Goblins while live git diff updates in real-time.
            </p>

            <div className="bg-[#080b12] border border-slate-800 p-2.5 rounded-xl mb-4 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Code Smells:</span>
                <span className="text-red-400 font-bold">{unfixedCode} warnings</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bound Action:</span>
                <span className="text-matrix-green font-bold">ESLINT / PRETTIER AST</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleLaunch('glitch-exterminator')}
            className="w-full py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-matrix-green text-emerald-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 group-hover:shadow-neon-matrix"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LAUNCH MISSION</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-slate-800/80 pt-4">
        <span>Google Antigravity Agentic IDE Showcase &copy; 2026 // Shadow Operator: The Chore Slayer</span>
        <div className="flex items-center gap-4">
          <span>Press [Tab] anytime for Reality Lens Desk</span>
          <span>Bottom Drawer for Time-Machine Rollback</span>
        </div>
      </div>
    </div>
  );
};
