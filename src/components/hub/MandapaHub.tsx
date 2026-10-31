import React, { useRef, useEffect } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { vedicSound } from '../../lib/audio/VedicSoundEngine';
import { ChoreModuleId } from '../../types';
import {
  Flame,
  Volume2,
  VolumeX,
  Eye,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Shield,
  BookOpen,
  Award,
} from 'lucide-react';

interface ModuleCardInfo {
  id: ChoreModuleId;
  titleDevanagari: string;
  titleEnglish: string;
  loreSubtitle: string;
  mythicDescription: string;
  accentColor: string;
  glowColor: string;
  badgeText: string;
  itemsPending: number;
  iconSymbol: string;
  actionPraise: string;
}

export const MandapaHub: React.FC = () => {
  const {
    setActiveModule,
    toggleRealityLens,
    toggleRealityDrawer,
    toggleSound,
    toggleTanpura,
    isSoundMuted,
    isTanpuraEnabled,
    soundVolume,
    setSoundVolume,
    stats,
    isSarathiAutopilotEnabled,
    toggleSarathiAutopilot,
    sarathiSpeed,
    setSarathiSpeed,
    liveAccountEmail,
    setMailConnectModalOpen,
    isSyncingGmail,
    syncRealGmail,
    emails,
    files,
    expenses,
    codeIssues,
    transactions,
    resetMockData,
  } = useTransactionStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating Diya flame ember particles on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const embers: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      decay: number;
    }[] = [];

    const colors = ['#f59e0b', '#d97706', '#fbbf24', '#dc2626', '#fef3c7'];

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Spawn golden oil lamp embers
      if (embers.length < 55 && Math.random() > 0.3) {
        embers.push({
          x: Math.random() * width,
          y: height + 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(0.8 + Math.random() * 1.8),
          radius: 1.2 + Math.random() * 2.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.2 + Math.random() * 0.7,
          decay: 0.002 + Math.random() * 0.005,
        });
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.alpha -= e.decay;

        if (e.alpha <= 0 || e.y < -20) {
          embers.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = e.color;
        ctx.globalAlpha = Math.max(0, e.alpha);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const unreadEmailsCount = emails.filter((e) => e.status === 'unread').length;
  const unsortedFilesCount = files.filter((f) => f.status === 'in_downloads').length;
  const pendingExpensesCount = expenses.filter((e) => e.status === 'pending_review').length;
  const unfixedCodeIssuesCount = codeIssues.filter((c) => c.status === 'unfixed').length;

  const modules: ModuleCardInfo[] = [
    {
      id: 'agni-pariksha',
      titleDevanagari: 'अग्नि परीक्षा',
      titleEnglish: 'Agni Pariksha',
      loreSubtitle: 'Inbox Zero // आग्नेयास्त्र संहार',
      mythicDescription:
        'Wield the divine Dhanush bow with flaming Agneyastra arrows to incinerate spam ravens and newsletter locusts. Confront Kumbhakarna’s 2,000 unread email backlog mothership.',
      accentColor: '#d97706',
      glowColor: 'rgba(217, 119, 6, 0.45)',
      badgeText: `${unreadEmailsCount} Unread Emails`,
      iconSymbol: '🏹',
      actionPraise: 'प्रवेश करें (Enter Trial)',
    },
    {
      id: 'mandara-sifter',
      titleDevanagari: 'मन्दरा मंथन',
      titleEnglish: 'Mandara Sifter',
      loreSubtitle: 'Desktop & Downloads // समुद्र मन्थन',
      mythicDescription:
        'Churn the cosmic ocean of chaotic Downloads using Mount Mandara. Sift copper plates, ancient manuscripts, and screenshots into sacred temple portals using magnetic wind pads.',
      accentColor: '#0284c7',
      glowColor: 'rgba(2, 132, 199, 0.45)',
      badgeText: `${unsortedFilesCount} Chaotic Files`,
      iconSymbol: '🌊',
      actionPraise: 'मन्थन आरम्भ (Churn Waters)',
    },
    {
      id: 'chitragupta-ledger',
      titleDevanagari: 'चित्रगुप्त लेखा',
      titleEnglish: "Chitragupta's Ledger",
      loreSubtitle: 'Expense Audit // कर्म तुला',
      mythicDescription:
        'Chitragupta weighs financial deeds on the divine scale. Swipe right for Dharma business deductions, left for Kama personal expenses to the resonant rhythm of Mridangam beats.',
      accentColor: '#16a34a',
      glowColor: 'rgba(22, 163, 74, 0.45)',
      badgeText: `${pendingExpensesCount} Pending Items`,
      iconSymbol: '⚖️',
      actionPraise: 'न्याय पीठ (Weigh Karma)',
    },
    {
      id: 'vritra-vyuha',
      titleDevanagari: 'वृत्र व्यूह',
      titleEnglish: "Vritra's Vyuha",
      loreSubtitle: 'AST Lint Rogue-lite // ऋत शुद्धि',
      mythicDescription:
        'The demon serpent Vritra withholds clean compilation. Slice Missing Semicolon Scorpions and banish Unused Import Wasps with the Khanda blade, watching live parchment code diffs update.',
      accentColor: '#dc2626',
      glowColor: 'rgba(220, 38, 38, 0.45)',
      badgeText: `${unfixedCodeIssuesCount} Glitch Bugs`,
      iconSymbol: '⚔️',
      actionPraise: 'असुर संहार (Purge Glitches)',
    },
  ];

  const handleSelectModule = (id: ChoreModuleId) => {
    vedicSound.playTempleBell(1.1, 2.5);
    vedicSound.playMridangam('chaapu');
    setActiveModule(id);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0b0e17] overflow-y-auto select-none font-sans text-[#ede5d5] jaali-texture flex flex-col justify-between">
      {/* Background Diya Flame Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-80" />

      {/* Decorative Ornate Temple Border Trim (Top & Bottom) */}
      <div className="h-2 w-full bg-gradient-to-r from-terracotta-deep via-vedic-gold to-vedic-vermilion shadow-md z-20" />

      {/* Main Temple Pavilion Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col justify-between">
        {/* ========================================================= */}
        {/* TOP TEMPLE HEADER & VEDIC AUDIO CONTROLS */}
        {/* ========================================================= */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-vedic-gold/30">
          {/* Left: Divine Title & Iconography */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-terracotta-deep to-[#181110] border-2 border-vedic-gold flex items-center justify-center shadow-vedic-gold animate-diya-flicker">
              <span className="text-3xl">🪔</span>
              <div className="absolute -inset-1 rounded-2xl border border-vedic-gold/40 animate-pulse-slow pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="font-devanagari text-2xl md:text-3xl font-extrabold gold-gradient-text tracking-wider">
                  कर्मयोगी
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40 font-bold uppercase tracking-widest">
                  अध्याय १ // NISHKAMA KARMA
                </span>
              </div>
              <h1 className="font-epic text-lg md:text-xl text-[#ede5d5] tracking-wide font-black">
                KARMAYOGI: THE KLESHA SLAYER
              </h1>
              <p className="text-xs text-[#cbbda3] italic font-serif">
                डिजिटल क्लेश संहार • Sacred Digital Purification Engine
              </p>
            </div>
          </div>

          {/* Right: Vedic Audio Controls, Reality Lens & Pratyahara Drawer Toggle */}
          <div className="flex items-center flex-wrap gap-2.5 justify-center">
            {/* Sarathi Autonomous AI Co-Pilot Pill */}
            <div className="flex items-center gap-1 bg-[#181b26]/90 p-0.5 rounded-xl border border-vedic-gold/40 shadow-sm">
              <button
                onClick={toggleSarathiAutopilot}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSarathiAutopilotEnabled
                    ? 'bg-gradient-to-r from-amber-500 to-vedic-gold text-slate-950 shadow-md animate-pulse'
                    : 'text-[#cbbda3] hover:text-white'
                }`}
                title="Toggle Autonomous AI Nishkama Co-Pilot (Autoplay with Conscious Escalation)"
              >
                <span>🪶</span>
                <span className="font-devanagari">सारथि {isSarathiAutopilotEnabled ? '[AUTO]' : '[MANUAL]'}</span>
              </button>

              {isSarathiAutopilotEnabled && (
                <button
                  onClick={() => {
                    const nextSpeed = sarathiSpeed === 1 ? 2 : sarathiSpeed === 2 ? 3 : 1;
                    setSarathiSpeed(nextSpeed);
                  }}
                  className="px-2 py-0.5 rounded-md bg-black/40 text-[11px] font-mono text-vedic-gold-bright hover:bg-black/60 font-bold"
                  title="Cycle AI Co-Pilot Execution Speed"
                >
                  {sarathiSpeed}x
                </button>
              )}
            </div>

            {/* Tanpura Drone Toggle */}
            <button
              onClick={toggleTanpura}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-md active:scale-95 ${
                isTanpuraEnabled
                  ? 'bg-vedic-gold/25 text-vedic-gold-bright border-vedic-gold shadow-vedic-gold animate-pulse'
                  : 'bg-[#181b26]/90 text-[#cbbda3] border-[#373c52] hover:text-[#ede5d5]'
              }`}
              title="Toggle Generative 4-String Tanpura Meditative Drone"
            >
              <span className="text-sm">🪕</span>
              <span>तम्पूरा {isTanpuraEnabled ? '[सक्रिय]' : '[शांत]'}</span>
            </button>

            {/* Temple Bell Chime */}
            <button
              onClick={() => vedicSound.playTempleBell(1.0, 3.2)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181b26]/90 hover:bg-vedic-gold/20 border border-vedic-gold/40 text-vedic-gold-bright text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Ring Sacred Temple Bell (Ghanta)"
            >
              <span>🔔</span>
              <span>घण्टा</span>
            </button>

            {/* Live Real Gmail Sync Button */}
            <button
              onClick={() => {
                if (liveAccountEmail) {
                  syncRealGmail();
                } else {
                  setMailConnectModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-vedic-gold/25 hover:from-amber-600/50 hover:to-vedic-gold/40 border border-vedic-gold text-vedic-gold-bright text-xs font-bold transition-all shadow-sm active:scale-95 font-devanagari"
              title={liveAccountEmail ? 'Sync latest unread emails from your Gmail' : 'Sign in with Google to sync your real Gmail'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin' : ''}`} />
              <span>{liveAccountEmail ? `जीमेल सिंक (${liveAccountEmail.split('@')[0]})` : 'जीमेल सिंक (Sync Real Gmail)'}</span>
            </button>

            {/* Master Sound Volume */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-[#181b26]/90 hover:bg-[#252836] border border-[#373c52] text-vedic-gold-bright transition-all"
              title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Reality Lens (Tab) Toggle */}
            <button
              onClick={toggleRealityLens}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-terracotta-deep to-[#7c2d12] hover:from-[#9a3412] hover:to-terracotta-deep border border-vedic-gold/60 text-[#ede5d5] rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              title="Open Real-World Desk View (Tab)"
            >
              <Eye className="w-3.5 h-3.5 text-vedic-gold-bright" />
              <span>प्रत्यक्ष दर्शन [Tab]</span>
            </button>

            {/* Pratyahara Time-Machine Drawer Toggle */}
            <button
              onClick={toggleRealityDrawer}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#181b26]/90 hover:bg-[#252836] border border-vedic-gold/40 text-vedic-gold-bright rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              title="Inspect Transaction Ledger & Global Rewind"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>प्रत्याहार ({transactions.length})</span>
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* PRATAH KARMA (प्रातः कर्म) DAILY RITUAL & AMBIENT CLUTTER STATUS */}
        {/* ========================================================= */}
        <section className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-[#171420] via-[#1c1626] to-[#151322] border-2 border-vedic-gold/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 font-devanagari">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-terracotta-deep/40 border border-vedic-gold/50 flex items-center justify-center text-2xl shadow-md">
              🌅
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="font-bold text-base gold-gradient-text tracking-wide">
                  प्रातः कर्म // DAILY DIGITAL CHITTA SHUDDHI RITUAL
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40 font-bold flex items-center gap-1 font-sans">
                  <span>🔥</span>
                  <span>5-Day Vedic Streak</span>
                </span>
              </div>
              <p className="text-xs text-[#cbbda3] font-serif mt-0.5">
                Chitta Shuddhi Index: <strong className="text-emerald-400 font-sans">94%</strong> • Cleanse 15 entropy kleshas before noon to maintain your mental clarity streak.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right font-sans text-xs">
              <span className="text-[#cbbda3] font-devanagari">परिवेश पहरेदार (Daemon Watcher):</span>
              <span className="text-emerald-400 font-bold font-mono">LIVE SYNC ACTIVE</span>
            </div>

            <button
              onClick={() => {
                vedicSound.init();
                vedicSound.playShankhaBlast();
                setActiveModule('agni-pariksha');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-terracotta-deep via-[#b45309] to-terracotta-deep hover:brightness-110 border border-vedic-gold text-white rounded-xl font-devanagari font-bold text-xs shadow-lg transition-all active:scale-95 whitespace-nowrap"
            >
              <span>⚔️</span>
              <span>आरम्भ // Begin 3-Min Sprint</span>
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SACRED KARMIC HUD STATS BAR */}
        {/* ========================================================= */}
        <section className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3 font-devanagari">
          {/* Punya Karma Points */}
          <div className="bg-gradient-to-b from-[#181b26] to-[#11131c] border border-vedic-gold/40 rounded-2xl p-3.5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vedic-gold/20 border border-vedic-gold/50 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <div className="text-[11px] text-[#cbbda3] uppercase tracking-wider font-sans font-bold">
                पुण्य (KARMA POINTS)
              </div>
              <div className="text-xl font-extrabold gold-gradient-text">
                {stats.karmaPoints.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Kleshas Cleansed */}
          <div className="bg-gradient-to-b from-[#181b26] to-[#11131c] border border-vedic-gold/40 rounded-2xl p-3.5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vedic-vermilion/20 border border-vedic-vermilion/50 flex items-center justify-center text-lg">
              🔥
            </div>
            <div>
              <div className="text-[11px] text-[#cbbda3] uppercase tracking-wider font-sans font-bold">
                क्लेश मुक्ति (CHORES DONE)
              </div>
              <div className="text-xl font-extrabold text-red-400">
                {stats.kleshasCleansed}
              </div>
            </div>
          </div>

          {/* Megabytes Purified */}
          <div className="bg-gradient-to-b from-[#181b26] to-[#11131c] border border-vedic-gold/40 rounded-2xl p-3.5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-500/50 flex items-center justify-center text-lg">
              🌊
            </div>
            <div>
              <div className="text-[11px] text-[#cbbda3] uppercase tracking-wider font-sans font-bold">
                शुद्धीकृत डेटा (FREED STORAGE)
              </div>
              <div className="text-xl font-extrabold text-sky-400">
                {stats.megabytesPurified} MB
              </div>
            </div>
          </div>

          {/* Tapasya Multiplier */}
          <div className="bg-gradient-to-b from-[#181b26] to-[#11131c] border border-vedic-gold/40 rounded-2xl p-3.5 shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-lg">
              📿
            </div>
            <div>
              <div className="text-[11px] text-[#cbbda3] uppercase tracking-wider font-sans font-bold">
                तपस्या गुणक (COMBO STREAK)
              </div>
              <div className="text-xl font-extrabold text-emerald-400">
                x{stats.combo || 1} <span className="text-xs text-[#cbbda3]">({stats.tapasyaMultiplier}x Bonus)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4 PLAYABLE SACRED CHORE MODULES (TEMPLE MANDAPA PAVILION) */}
        {/* ========================================================= */}
        <main className="my-auto py-2">
          <div className="text-center mb-6">
            <h2 className="font-epic text-2xl md:text-3xl text-vedic-gold-bright font-black tracking-wide">
              चतुर्विंशति कर्मशाला // THE 4 SACRED TRIALS
            </h2>
            <p className="text-xs md:text-sm text-[#cbbda3] font-serif max-w-2xl mx-auto mt-1">
              Select a sacred chore pavilion. Transmute digital entropy into pure consciousness (चित्तशुद्धि) through high-octane ritual action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modules.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectModule(m.id)}
                className="group relative cursor-pointer rounded-2xl bg-gradient-to-br from-[#181b26] via-[#121520] to-[#0d0f18] border-2 border-vedic-gold/40 hover:border-vedic-gold p-6 transition-all duration-300 hover:shadow-vedic-gold hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative Indian Miniature Corner Arch Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-vedic-gold/10 to-transparent pointer-events-none rounded-bl-full border-b border-l border-vedic-gold/20 group-hover:from-vedic-gold/20" />

                <div>
                  {/* Card Header: Symbol & Titles */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#0a0c14] border border-vedic-gold/50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        {m.iconSymbol}
                      </div>
                      <div>
                        <div className="text-[11px] text-vedic-gold font-bold tracking-widest uppercase font-devanagari">
                          {m.loreSubtitle}
                        </div>
                        <h3 className="font-devanagari text-2xl font-black text-white group-hover:text-vedic-gold-bright transition-colors">
                          {m.titleDevanagari}
                        </h3>
                        <div className="font-cinzel text-xs text-[#cbbda3] tracking-wider uppercase font-semibold">
                          {m.titleEnglish}
                        </div>
                      </div>
                    </div>

                    {/* Pending Items Badge */}
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0b0e17] border border-vedic-gold/40 text-vedic-gold-bright shadow-sm whitespace-nowrap">
                      {m.badgeText}
                    </span>
                  </div>

                  {/* Lore Description */}
                  <p className="text-xs text-[#cbbda3] font-serif leading-relaxed mb-5">
                    {m.mythicDescription}
                  </p>
                </div>

                {/* Card Action Bar */}
                <div className="pt-4 border-t border-vedic-gold/20 flex items-center justify-between text-xs">
                  <span className="font-devanagari text-[#ede5d5] font-semibold flex items-center gap-1.5 text-vedic-gold-bright">
                    <Sparkles className="w-3.5 h-3.5 text-vedic-gold" />
                    <span>कर्म फलम् प्राप्यते</span>
                  </span>

                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-terracotta-deep to-vedic-gold hover:from-vedic-gold hover:to-terracotta-deep text-white font-devanagari font-bold text-xs tracking-wide shadow-md group-hover:scale-105 transition-all">
                    <span>{m.actionPraise}</span>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ========================================================= */}
        {/* TEMPLE FOOTER & SACRED SHLOKA */}
        {/* ========================================================= */}
        <footer className="pt-6 border-t border-vedic-gold/30 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#cbbda3] text-center md:text-left">
          <div className="font-devanagari">
            <span className="gold-gradient-text font-bold">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।</span>
            <span className="italic block sm:inline sm:ml-2 text-[11px] text-[#a89980]">
              "Set thy heart upon thy work, but never upon its reward." (Bhagavad Gita 2.47)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={resetMockData}
              className="text-[#cbbda3] hover:text-white underline decoration-vedic-gold/50"
            >
              Reset Sacred Mock Data (500+ Items)
            </button>
            <span className="text-vedic-gold/40">•</span>
            <span>Google Antigravity Agentic IDE</span>
          </div>
        </footer>
      </div>

      {/* Decorative Ornate Temple Border Trim (Bottom) */}
      <div className="h-2 w-full bg-gradient-to-r from-vedic-vermilion via-vedic-gold to-terracotta-deep shadow-md z-20" />
    </div>
  );
};
