import React, { useEffect, useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { vedicSound } from '../../lib/audio/VedicSoundEngine';
import { MandapaHub } from '../hub/MandapaHub';
import { AgniPariksha } from '../modules/AgniPariksha';
import { MandaraSifter } from '../modules/MandaraSifter';
import { ChitraguptaLedger } from '../modules/ChitraguptaLedger';
import { VritraVyuha } from '../modules/VritraVyuha';
import { RealityDrawer } from './RealityDrawer';
import { RealityLens } from './RealityLens';
import { TutorialModal } from './TutorialModal';
import { SarathiEscalationModal } from './SarathiEscalationModal';
import { LiveMailConnectModal } from './LiveMailConnectModal';
import {
  Volume2,
  VolumeX,
  Eye,
  RotateCcw,
  BookOpen,
  Sparkles,
  ChevronLeft,
  Sliders,
  Zap,
} from 'lucide-react';

export const ArcadeCabinet: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isSoundMuted,
    toggleSound,
    isTanpuraEnabled,
    toggleTanpura,
    soundVolume,
    setSoundVolume,
    isScreenShakeEnabled,
    toggleScreenShake,
    isTutorialOpen,
    toggleTutorial,
    toggleRealityLens,
    toggleRealityDrawer,
    isSarathiAutopilotEnabled,
    toggleSarathiAutopilot,
    sarathiSpeed,
    setSarathiSpeed,
    sarathiStats,
  } = useTransactionStore();

  const [showVolumePopup, setShowVolumePopup] = useState(false);

  // Global Hotkeys: Tab (Reality Lens), H (Guide), Escape (Return to Mandapa)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        toggleRealityLens();
      } else if (e.key === 'h' || e.key === 'H') {
        if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
          toggleTutorial();
        }
      } else if (e.key === 'Escape') {
        if (activeModule) {
          setActiveModule(null);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleRealityLens, toggleTutorial, activeModule, setActiveModule]);

  const getModuleTitle = () => {
    if (!activeModule) return '';
    if (activeModule === 'agni-pariksha' || activeModule === 'nebula-purge') return 'अग्नि परीक्षा (Agni Pariksha)';
    if (activeModule === 'mandara-sifter' || activeModule === 'gravity-sifter') return 'मन्दरा मंथन (Mandara Sifter)';
    if (activeModule === 'chitragupta-ledger' || activeModule === 'neon-audit') return 'चित्रगुप्त लेखा (Chitragupta’s Ledger)';
    if (activeModule === 'vritra-vyuha' || activeModule === 'glitch-exterminator') return 'वृत्र व्यूह (Vritra’s Vyuha)';
    return activeModule;
  };

  return (
    <div className="relative w-screen h-screen bg-[#070911] overflow-hidden flex flex-col font-sans text-[#ede5d5] select-none">
      {/* Top Temple Arch Bezel */}
      <header className="h-13 bg-[#0d101c] border-b-2 border-vedic-gold/40 px-3 sm:px-6 flex items-center justify-between z-30 select-none shadow-lg">
        {/* Left: Brand / Return to Mandapa Hub */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveModule(null)}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Return to Mandapa Pavilion [Esc]"
          >
            <div className="p-1.5 rounded-xl bg-vedic-gold/15 text-vedic-gold-bright border border-vedic-gold/40 group-hover:shadow-vedic-gold transition-all">
              <span className="text-base">🪔</span>
            </div>
            <span className="font-devanagari text-sm sm:text-base font-black tracking-wider text-white group-hover:text-vedic-gold-bright transition-colors">
              कर्मयोगी // KARMAYOGI
            </span>
          </div>

          {activeModule && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-vedic-gold/40">/</span>
              <button
                onClick={() => setActiveModule(null)}
                className="flex items-center gap-1 text-vedic-gold-bright font-devanagari font-bold uppercase hover:text-white transition-colors bg-vedic-gold/20 px-2.5 py-0.5 rounded-xl border border-vedic-gold/40"
                title="Back to Temple Pavilion [Esc]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{getModuleTitle()}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-2">
          {/* Sarathi AI Autonomous Co-Pilot Pill */}
          <div className="flex items-center gap-1 bg-[#181b26] p-0.5 rounded-xl border border-vedic-gold/40 shadow-sm">
            <button
              onClick={toggleSarathiAutopilot}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isSarathiAutopilotEnabled
                  ? 'bg-gradient-to-r from-amber-500 to-vedic-gold text-slate-950 shadow-md animate-pulse'
                  : 'text-[#cbbda3] hover:text-white'
              }`}
              title="Toggle Autonomous AI Nishkama Co-Pilot (Autoplay with Escalation)"
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

          {/* Tanpura Drone */}
          <button
            onClick={toggleTanpura}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
              isTanpuraEnabled
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border-vedic-gold shadow-vedic-gold animate-pulse'
                : 'text-[#cbbda3] border-[#373c52] hover:text-white'
            }`}
            title="Toggle Generative Tanpura Drone"
          >
            <span>🪕</span>
            <span className="hidden sm:inline font-devanagari">तम्पूरा</span>
          </button>

          {/* Temple Bell */}
          <button
            onClick={() => vedicSound.playTempleBell(1.0, 3.0)}
            className="p-1.5 rounded-xl bg-[#181b26] hover:bg-vedic-gold/20 border border-vedic-gold/30 text-vedic-gold-bright transition-all"
            title="Ring Sacred Temple Bell"
          >
            <span>🔔</span>
          </button>

          {/* Sound & Volume Control Popover */}
          <div className="relative">
            <button
              onClick={() => setShowVolumePopup((prev) => !prev)}
              className="p-1.5 rounded-xl bg-[#181b26] hover:bg-[#252836] border border-[#373c52] text-vedic-gold-bright transition-colors"
              title="Vedic Audio Volume"
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {showVolumePopup && (
              <div className="absolute right-0 top-10 w-48 bg-[#121522] border-2 border-vedic-gold/60 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-xs font-devanagari">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">ध्वनि नियंत्रण</span>
                  <button
                    onClick={toggleSound}
                    className="text-[10px] text-vedic-gold-bright font-bold hover:underline"
                  >
                    {isSoundMuted ? 'UNMUTE' : 'MUTE'}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isSoundMuted ? 0 : soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[10px] text-[#cbbda3] text-right mt-1 font-mono">
                  {Math.round(soundVolume * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Screen Shake Toggle */}
          <button
            onClick={toggleScreenShake}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
              isScreenShakeEnabled
                ? 'bg-vedic-gold/20 text-vedic-gold-bright border-vedic-gold/50'
                : 'text-slate-500 border-slate-700 bg-[#181b26]'
            }`}
            title={`Micro-Screen Shake: ${isScreenShakeEnabled ? 'ON' : 'OFF'}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Guide [H] */}
          <button
            onClick={toggleTutorial}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#181b26] hover:bg-vedic-gold/20 border border-vedic-gold/40 text-vedic-gold-bright rounded-xl text-xs font-bold transition-all active:scale-95"
            title="Open Sacred Field Manual [H]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-devanagari">शास्त्र [H]</span>
          </button>

          {/* Reality Lens [Tab] */}
          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-terracotta-deep to-vedic-gold hover:from-vedic-gold hover:to-terracotta-deep border border-vedic-gold/60 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            title="Toggle Reality Desk View [Tab]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="font-devanagari">प्रत्यक्ष [Tab]</span>
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="relative flex-1 w-full overflow-hidden">
        {!activeModule && <MandapaHub />}
        {(activeModule === 'agni-pariksha' || activeModule === 'nebula-purge') && (
          <AgniPariksha onBackToHub={() => setActiveModule(null)} />
        )}
        {(activeModule === 'mandara-sifter' || activeModule === 'gravity-sifter') && (
          <MandaraSifter onBackToHub={() => setActiveModule(null)} />
        )}
        {(activeModule === 'chitragupta-ledger' || activeModule === 'neon-audit') && (
          <ChitraguptaLedger onBackToHub={() => setActiveModule(null)} />
        )}
        {(activeModule === 'vritra-vyuha' || activeModule === 'glitch-exterminator') && (
          <VritraVyuha onBackToHub={() => setActiveModule(null)} />
        )}
      </main>

      {/* Persistent Pratyahara Time-Machine Drawer */}
      <RealityDrawer />

      {/* Fullscreen Reality Lens Desk View Overlay */}
      <RealityLens />

      {/* Sacred Field Manual Modal */}
      <TutorialModal />

      {/* Sarathi AI Co-Pilot Escalation Modal */}
      <SarathiEscalationModal />

      {/* Live Gmail & Mailbox Bridge Modal */}
      <LiveMailConnectModal />
    </div>
  );
};
