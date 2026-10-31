import React, { useState, useEffect, useRef } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { sound } from '../../lib/audio/soundEngine';
import { ExpenseArtifact } from '../../types';
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  DollarSign,
  Receipt,
  Sparkles,
  Building2,
  Scan,
  Volume2,
  VolumeX,
  FileText,
  Flame,
  Award,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface RhythmParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}

export const NeonAudit: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
  const {
    expenses,
    approveBusinessExpense,
    flagPersonalExpense,
    disputeExpense,
    addScore,
    incrementCombo,
    resetCombo,
    stats,
    toggleRealityLens,
  } = useTransactionStore();

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'right' | 'left' | 'up' | null>(null);
  const [isFlinging, setIsFlinging] = useState(false);

  // Rhythm & BPM Engine (120 BPM = 500ms per beat)
  const BPM = 120;
  const BEAT_MS = 60000 / BPM; // 500ms
  const [beatCount, setBeatCount] = useState(0);
  const [beatPhase, setBeatPhase] = useState(0);
  const [playBeatAudio, setPlayBeatAudio] = useState(true);
  const [lastJudgment, setLastJudgment] = useState<{ text: string; color: string; timing: string } | null>(null);
  const [isOverdrive, setIsOverdrive] = useState(false);
  const [overdriveStreak, setOverdriveStreak] = useState(0);
  const [autoPilot, setAutoPilot] = useState(false);

  // Inspector modal toggle
  const [inspectingExpense, setInspectingExpense] = useState<ExpenseArtifact | null>(null);

  // Particles & Animations
  const [particles, setParticles] = useState<RhythmParticle[]>([]);
  const lastBeatTimeRef = useRef(Date.now());
  const dragStartRef = useRef({ x: 0, y: 0 });
  const autoPilotRef = useRef(false);
  const currentCardRef = useRef<ExpenseArtifact | null>(null);
  const isFlingingRef = useRef(false);

  const pendingExpenses = expenses.filter((e) => e.status === 'pending_review');
  const currentCard = pendingExpenses[0] || null;
  const nextCards = pendingExpenses.slice(1, 4);

  useEffect(() => {
    autoPilotRef.current = autoPilot;
  }, [autoPilot]);

  useEffect(() => {
    currentCardRef.current = currentCard;
  }, [currentCard]);

  useEffect(() => {
    isFlingingRef.current = isFlinging;
  }, [isFlinging]);

  // 1. High-Precision Rhythm Beat Loop
  useEffect(() => {
    sound.init();

    const interval = setInterval(() => {
      const now = Date.now();
      lastBeatTimeRef.current = now;

      setBeatCount((prev) => {
        const next = prev + 1;
        const isDownbeat = next % 4 === 0;

        // Play procedural synthwave rhythm beat if enabled
        if (playBeatAudio) {
          sound.playRhythmBeat(isDownbeat);
        }

        // Auto-Pilot AI Decision on every 2 beats
        if (autoPilotRef.current && next % 2 === 0 && currentCardRef.current && !isFlingingRef.current) {
          const card = currentCardRef.current;
          let dir: 'right' | 'left' | 'up' = 'right';
          if (card.confidence > 0.8) {
            dir = 'right';
          } else if (card.suggestedCategory.includes('Personal') || card.confidence < 0.6) {
            dir = 'left';
          } else {
            dir = 'right';
          }
          triggerDecision(dir);
        }

        return next;
      });

      // Quick visual pulse
      setBeatPhase(1);
      setTimeout(() => setBeatPhase(0), 180);
    }, BEAT_MS);

    return () => clearInterval(interval);
  }, [playBeatAudio]);

  // Particle update loop
  useEffect(() => {
    if (particles.length === 0) return;
    const animId = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life + 1,
            alpha: Math.max(0, 1 - p.life / p.maxLife),
          }))
          .filter((p) => p.life < p.maxLife)
      );
    });
    return () => cancelAnimationFrame(animId);
  }, [particles]);

  const addParticles = (x: number, y: number, color: string, count = 16) => {
    const newP: RhythmParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      newP.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        size: 2 + Math.random() * 3,
      });
    }
    setParticles((prev) => [...prev, ...newP]);
  };

  // 2. Rhythm Precision Judgment Calculator
  const judgeTiming = (): { judgment: string; multiplier: number; color: string } => {
    const now = Date.now();
    const timeSinceLast = now - lastBeatTimeRef.current;
    const delta = Math.min(timeSinceLast, BEAT_MS - timeSinceLast);

    if (delta <= 75) {
      // Perfect On-Beat Hit!
      sound.playPerfectTiming();
      setOverdriveStreak((prev) => {
        const next = prev + 1;
        if (next >= 4 && !isOverdrive) {
          setIsOverdrive(true);
          sound.playOverdriveFanfare();
        }
        return next;
      });
      return { judgment: '🔥 PERFECT BEAT! x2', multiplier: 2.0, color: '#00ff66' };
    } else if (delta <= 140) {
      // Great Timing
      return { judgment: '⚡ GREAT TIMING!', multiplier: 1.5, color: '#00f3ff' };
    } else {
      // Off-beat
      setOverdriveStreak(0);
      setIsOverdrive(false);
      return { judgment: 'OFF-BEAT', multiplier: 1.0, color: '#94a3b8' };
    }
  };

  // 3. Execution of Chore Decision
  const triggerDecision = (direction: 'right' | 'left' | 'up') => {
    if (!currentCard || isFlinging || isFlingingRef.current) return;

    setIsFlinging(true);
    isFlingingRef.current = true;
    setSwipeDirection(direction);

    // Calculate timing accuracy
    const timing = judgeTiming();
    setLastJudgment({
      text: timing.judgment,
      color: timing.color,
      timing: `${Math.round(timing.multiplier * 100)}% Sync`,
    });

    // Fling off-screen coordinates
    const targetX = direction === 'right' ? 800 : direction === 'left' ? -800 : 0;
    const targetY = direction === 'up' ? -700 : dragOffset.y;
    setDragOffset({ x: targetX, y: targetY });

    sound.playCardSwipe(direction);

    const cardCenterX = window.innerWidth / 2;
    const cardCenterY = window.innerHeight / 2;

    setTimeout(() => {
      const baseScore = direction === 'up' ? 500 : direction === 'right' ? 350 : 200;
      const overdriveMultiplier = isOverdrive ? 2.5 : 1;
      const finalScore = Math.round(baseScore * timing.multiplier * overdriveMultiplier);

      if (direction === 'right') {
        sound.playApproveChime();
        addParticles(cardCenterX + 200, cardCenterY, '#00ff66', 24);
        approveBusinessExpense(currentCard.id);
      } else if (direction === 'left') {
        sound.playPersonalFlag();
        addParticles(cardCenterX - 200, cardCenterY, '#94a3b8', 16);
        flagPersonalExpense(currentCard.id);
      } else if (direction === 'up') {
        sound.playExplosion('small');
        addParticles(cardCenterX, cardCenterY - 200, '#ff0055', 28);
        disputeExpense(currentCard.id);
      }

      addScore(finalScore);
      incrementCombo();

      // Reset card position for next in stack
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      setIsFlinging(false);
      isFlingingRef.current = false;
    }, 200);
  };

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentCard || isFlinging) return;

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        triggerDecision('right');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        triggerDecision('left');
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        triggerDecision('up');
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Space / Enter: Instant AI Recommended Action!
        e.preventDefault();
        if (currentCard.confidence > 0.8) {
          triggerDecision('right');
        } else if (currentCard.suggestedCategory.includes('Personal') || currentCard.confidence < 0.6) {
          triggerDecision('left');
        } else {
          triggerDecision('right');
        }
      } else if (e.key === 'i' || e.key === 'I') {
        setInspectingExpense((prev) => (prev ? null : currentCard));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, isFlinging, isOverdrive]);

  // Touch / Pointer Drag Events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFlinging) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isFlinging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });

    if (dx > 90) setSwipeDirection('right');
    else if (dx < -90) setSwipeDirection('left');
    else if (dy < -80) setSwipeDirection('up');
    else setSwipeDirection(null);
  };

  const handlePointerUp = () => {
    if (!isDragging || isFlinging) return;
    setIsDragging(false);

    if (dragOffset.x > 120) {
      triggerDecision('right');
    } else if (dragOffset.x < -120) {
      triggerDecision('left');
    } else if (dragOffset.y < -100) {
      triggerDecision('up');
    } else {
      // Elastic spring snap-back
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const rotationDeg = (dragOffset.x / 14) * 0.75;

  return (
    <div className="relative w-full h-full bg-[#08090f] flex flex-col items-center justify-between overflow-hidden select-none font-mono text-slate-100">
      {/* Dynamic Synthwave Horizon Background */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          isOverdrive
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-purple-950/20 to-[#08090f]'
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0a0b12] to-[#050609]'
        }`}
      />

      {/* Overdrive Golden Frame Glow */}
      {isOverdrive && (
        <div className="absolute inset-0 border-4 border-amber-400/60 pointer-events-none shadow-[inset_0_0_60px_rgba(255,170,0,0.3)] animate-pulse z-20" />
      )}

      {/* Top HUD */}
      <div className="relative z-30 w-full px-4 sm:px-6 pt-3 flex items-center justify-between text-xs">
        {/* Left: Score & Audited Amount */}
        <div className="flex items-center gap-3 bg-[#0d111a]/85 border border-amber-500/40 backdrop-blur-md px-4 py-2 rounded-xl shadow-neon-amber">
          <button
            onClick={onBackToHub}
            className="p-1 hover:bg-amber-500/20 text-amber-400 rounded transition-colors"
            title="Return to Cabinet Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-amber-400 tracking-wider font-bold">MODULE C // NEON AUDIT</div>
            <div className="text-sm font-extrabold text-white">SCORE: {stats.score.toLocaleString()}</div>
          </div>
          <div className="h-6 w-px bg-amber-500/30" />
          <div>
            <div className="text-[10px] text-slate-400">TAX DEDUCTIBLE</div>
            <div className="text-sm font-bold text-emerald-400">${stats.dollarsAudited.toFixed(2)}</div>
          </div>
          <div className="h-6 w-px bg-amber-500/30" />
          <div>
            <div className="text-[10px] text-slate-400">QUEUE</div>
            <div className="text-sm font-bold text-amber-300">{pendingExpenses.length} items</div>
          </div>
        </div>

        {/* Center: Overdrive Status Badge & Combo */}
        <div className="flex items-center gap-3">
          {isOverdrive ? (
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-[0_0_25px_rgba(255,170,0,0.7)] animate-bounce">
              <Flame className="w-4 h-4 fill-current text-red-600" />
              <span>HYPER-FOCUS OVERDRIVE x{stats.combo}</span>
            </div>
          ) : stats.combo > 1 ? (
            <div className="bg-gradient-to-r from-amber-950 to-orange-950 border border-amber-500/60 px-3.5 py-1.5 rounded-full text-amber-300 font-bold animate-pulse shadow-neon-amber flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>COMBO x{stats.combo}</span>
            </div>
          ) : null}
        </div>

        {/* Right Controls: Audio Ticker, Auto-Pilot & Reality Lens */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPilot((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
              autoPilot
                ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/20 text-emerald-300 border-emerald-400 shadow-neon-matrix animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Auto-Pilot AI Rhythm Classifier"
          >
            <Sparkles className={`w-3.5 h-3.5 ${autoPilot ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500'}`} />
            <span>AUTO-PILOT: {autoPilot ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setPlayBeatAudio((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
              playBeatAudio
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-neon-amber'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
            title="Toggle 120 BPM Synthwave Heartbeat Audio"
          >
            {playBeatAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>BEAT: {playBeatAudio ? '120 BPM' : 'MUTED'}</span>
          </button>

          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 rounded-lg font-bold transition-all shadow-md active:scale-95 text-xs"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Reality Ledger [Tab]</span>
          </button>
        </div>
      </div>

      {/* SYNTHWAVE RHYTHM HIGHWAY BAR */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-4 mt-2">
        <div className="bg-[#0e121e]/90 border border-amber-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mb-1.5 px-1">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3 h-3" />
              SYNTHWAVE RHYTHM HIGHWAY (120 BPM)
            </span>
            <span>
              {lastJudgment ? (
                <span style={{ color: lastJudgment.color }} className="font-extrabold animate-pulse">
                  {lastJudgment.text}
                </span>
              ) : (
                'Swipe on the pulse beat for 2x combo'
              )}
            </span>
          </div>

          {/* Beat Track Visualizer with Converging Markers */}
          <div className="relative h-6 bg-[#070911] rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Center Target Gate */}
            <div
              className={`w-12 h-full rounded border-2 transition-all duration-150 flex items-center justify-center z-10 ${
                beatPhase === 1
                  ? 'border-amber-400 bg-amber-400/30 shadow-[0_0_20px_rgba(255,170,0,0.8)] scale-110'
                  : 'border-slate-600 bg-slate-900/60'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-transform ${
                  beatPhase === 1 ? 'bg-white scale-125' : 'bg-amber-400/50'
                }`}
              />
            </div>

            {/* Traveling Beat Bars (Left & Right) */}
            <div
              className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-amber-500 to-cyan-400 rounded opacity-75"
              style={{
                transform: `translateX(${((Date.now() % BEAT_MS) / BEAT_MS) * 230}px)`,
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-amber-500 to-cyan-400 rounded opacity-75"
              style={{
                transform: `translateX(-${((Date.now() % BEAT_MS) / BEAT_MS) * 230}px)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* MAIN 3D LAYERED CARD CHAMBER */}
      <div className="relative z-20 w-full max-w-md h-[460px] flex items-center justify-center my-auto">
        {/* Destination Terminal Apertures */}
        {/* Left Terminal: Personal Archive */}
        <div
          className={`absolute left-0 -translate-x-12 top-1/2 -translate-y-1/2 w-28 h-64 border-2 rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all duration-200 pointer-events-none ${
            swipeDirection === 'left'
              ? 'border-slate-300 bg-slate-800/60 scale-105 shadow-[0_0_35px_rgba(148,163,184,0.5)]'
              : 'border-slate-800/80 bg-slate-950/30 opacity-40'
          }`}
        >
          <XCircle className="w-8 h-8 text-slate-400 mb-2" />
          <div className="text-[10px] font-bold text-slate-300 tracking-wider">PERSONAL</div>
          <div className="text-[9px] text-slate-500">EXCLUDE [A]</div>
        </div>

        {/* Right Terminal: Business Vault */}
        <div
          className={`absolute right-0 translate-x-12 top-1/2 -translate-y-1/2 w-28 h-64 border-2 rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all duration-200 pointer-events-none ${
            swipeDirection === 'right'
              ? 'border-emerald-400 bg-emerald-950/60 scale-105 shadow-[0_0_40px_rgba(0,255,102,0.6)]'
              : 'border-emerald-900/40 bg-slate-950/30 opacity-40'
          }`}
        >
          <CheckCircle className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
          <div className="text-[10px] font-bold text-emerald-300 tracking-wider">BUSINESS</div>
          <div className="text-[9px] text-emerald-500">TAX WRITE-OFF [D]</div>
        </div>

        {/* Top Terminal: Dispute Silo */}
        <div
          className={`absolute top-0 -translate-y-8 left-1/2 -translate-x-1/2 h-14 w-60 border-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 pointer-events-none ${
            swipeDirection === 'up'
              ? 'border-red-400 bg-red-950/70 scale-105 shadow-[0_0_35px_rgba(255,0,85,0.6)]'
              : 'border-red-900/30 bg-slate-950/30 opacity-40'
          }`}
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div className="text-[11px] font-bold text-red-300">DISPUTE / SPLIT CHARGE [W]</div>
        </div>

        {/* Render 3D Layered Cards Stack */}
        {currentCard ? (
          <div className="relative w-[350px] h-[440px] flex items-center justify-center">
            {/* Background Layer 3 */}
            {nextCards[2] && (
              <div
                className="absolute w-[350px] h-[440px] bg-[#0c0f1c] border border-slate-800/50 rounded-2xl p-6 pointer-events-none transition-all duration-300"
                style={{
                  transform: 'translateY(28px) scale(0.86)',
                  opacity: 0.35,
                  zIndex: 1,
                }}
              />
            )}

            {/* Background Layer 2 */}
            {nextCards[1] && (
              <div
                className="absolute w-[350px] h-[440px] bg-[#0e1222] border border-slate-800 rounded-2xl p-6 pointer-events-none transition-all duration-300"
                style={{
                  transform: 'translateY(16px) scale(0.92)',
                  opacity: 0.65,
                  zIndex: 2,
                }}
              />
            )}

            {/* Background Layer 1 (Immediately behind active card) */}
            {nextCards[0] && (
              <div
                className="absolute w-[350px] h-[440px] bg-[#11162b] border border-amber-500/20 rounded-2xl p-6 pointer-events-none transition-all duration-300"
                style={{
                  transform: 'translateY(8px) scale(0.96)',
                  opacity: 0.88,
                  zIndex: 3,
                }}
              >
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>{nextCards[0].merchant}</span>
                  <span className="font-bold">${nextCards[0].amount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* FRONT ACTIVE CARD (Interactive & Draggable) */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotationDeg}deg)`,
                transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                zIndex: 10,
              }}
              className={`w-[350px] h-[440px] bg-gradient-to-b from-[#141a2e] to-[#0c0e18] border-2 rounded-2xl p-6 flex flex-col justify-between shadow-2xl cursor-grab active:cursor-grabbing relative overflow-hidden select-none ${
                swipeDirection === 'right'
                  ? 'border-emerald-400 shadow-[0_0_40px_rgba(0,255,102,0.5)]'
                  : swipeDirection === 'left'
                  ? 'border-slate-400 shadow-[0_0_40px_rgba(148,163,184,0.4)]'
                  : swipeDirection === 'up'
                  ? 'border-red-400 shadow-[0_0_40px_rgba(255,0,85,0.5)]'
                  : isOverdrive
                  ? 'border-amber-400 shadow-neon-amber'
                  : 'border-amber-500/50 shadow-neon-amber'
              }`}
            >
              {/* Holographic Laser Scan Line */}
              <div
                className="absolute left-0 right-0 h-1 bg-cyan-400 opacity-60 pointer-events-none shadow-[0_0_12px_#00f3ff]"
                style={{
                  top: `${((Date.now() % 2000) / 2000) * 100}%`,
                }}
              />

              {/* Dynamic Watermark Stamp Overlay */}
              {swipeDirection === 'right' && (
                <div className="absolute top-10 left-6 border-4 border-emerald-400 text-emerald-400 font-black text-2xl px-4 py-1.5 rounded-xl -rotate-12 bg-emerald-950/90 tracking-wider shadow-2xl animate-bounce">
                  TAX APPROVED
                </div>
              )}
              {swipeDirection === 'left' && (
                <div className="absolute top-10 right-6 border-4 border-slate-400 text-slate-300 font-black text-2xl px-4 py-1.5 rounded-xl rotate-12 bg-slate-900/90 tracking-wider shadow-2xl">
                  PERSONAL
                </div>
              )}
              {swipeDirection === 'up' && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 border-4 border-red-500 text-red-400 font-black text-xl px-4 py-1 rounded-xl bg-red-950/90 tracking-wider shadow-2xl">
                  DISPUTE FILED
                </div>
              )}

              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    {currentCard.account}
                  </span>
                  <span className="text-slate-500">{currentCard.date}</span>
                </div>

                {/* Big Price Line */}
                <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1 my-2">
                  <span className="text-2xl text-amber-400 font-normal">$</span>
                  {currentCard.amount.toFixed(2)}
                </div>

                <h3 className="text-lg font-bold text-slate-100 truncate" title={currentCard.merchant}>
                  {currentCard.merchant}
                </h3>
              </div>

              {/* OCR Scanner & Category Box */}
              <div className="my-3 bg-[#0a0d17]/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tax Category:</span>
                  <span className="text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    {currentCard.suggestedCategory}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">OCR Confidence:</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(currentCard.confidence * 100)}% Verified
                  </span>
                </div>

                {/* OCR Receipt Snippet */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-amber-400" />
                      OCR DIGITAL RECEIPT:
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingExpense(currentCard);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 text-[10px]"
                    >
                      Inspect <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 italic font-mono bg-black/50 p-2 rounded border border-slate-800/80 line-clamp-2">
                    "{currentCard.ocrSnippet}"
                  </p>
                </div>
              </div>

              {/* Bottom Card Controls Helper */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">← [A] Personal</span>
                <span className="text-red-400 font-semibold">↑ [W] Dispute</span>
                <span className="text-emerald-400 font-semibold">[D] Business →</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-[#101424] border border-emerald-500/40 rounded-2xl shadow-neon-matrix max-w-sm">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">AUDIT RECONCILIATION COMPLETE</h3>
            <p className="text-xs text-slate-400 mb-5">
              100% of receipts classified into IRS deductible accounting categories.
            </p>
            <button
              onClick={onBackToHub}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg active:scale-95"
            >
              Return to Mission Hub
            </button>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTONS */}
      {currentCard && (
        <div className="relative z-30 flex items-center gap-4 mb-3">
          {/* Left: Personal */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => triggerDecision('left')}
              className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-600 hover:border-slate-300 text-slate-300 flex items-center justify-center transition-all shadow-lg active:scale-90"
              title="Flag as Personal Expense [A / Left Arrow]"
            >
              <XCircle className="w-6 h-6 text-slate-400" />
            </button>
            <span className="text-[10px] text-slate-400 font-bold tracking-tight">[A] PERSONAL</span>
          </div>

          {/* Center-Left: Dispute */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => triggerDecision('up')}
              className="w-12 h-12 rounded-full bg-red-950 border-2 border-red-500 hover:border-red-400 text-red-300 flex items-center justify-center transition-all shadow-neon-magenta active:scale-90"
              title="Dispute / Chargeback Ticket [W / Up Arrow]"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
            </button>
            <span className="text-[10px] text-red-400 font-bold tracking-tight">[W] DISPUTE</span>
          </div>

          {/* Center-Right: AI Quick Pass */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                if (currentCard.confidence > 0.8) {
                  triggerDecision('right');
                } else if (currentCard.suggestedCategory.includes('Personal') || currentCard.confidence < 0.6) {
                  triggerDecision('left');
                } else {
                  triggerDecision('right');
                }
              }}
              className="px-4 h-12 rounded-full bg-cyan-950 border-2 border-cyan-400 hover:border-cyan-300 text-cyan-300 flex items-center gap-1.5 transition-all shadow-neon-cyan active:scale-90 font-bold text-xs"
              title="Auto Classify with AI Confidence [Space / Enter]"
            >
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>AI PASS</span>
            </button>
            <span className="text-[10px] text-cyan-400 font-bold tracking-tight">[SPACE] AI</span>
          </div>

          {/* Right: Business */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => triggerDecision('right')}
              className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-emerald-400 hover:border-emerald-300 text-emerald-300 flex items-center justify-center transition-all shadow-neon-matrix active:scale-90"
              title="Approve Business Expense [D / Right Arrow]"
            >
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </button>
            <span className="text-[10px] text-emerald-400 font-bold tracking-tight">[D] BUSINESS</span>
          </div>
        </div>
      )}

      {/* RENDER PARTICLES */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.alpha,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* HOLOGRAPHIC RECEIPT INSPECTOR MODAL */}
      {inspectingExpense && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e121d] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-neon-cyan relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Scan className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span>HOLOGRAPHIC OCR INSPECTION // {inspectingExpense.merchant}</span>
              </div>
              <button
                onClick={() => setInspectingExpense(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#080a12] p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Transaction ID</div>
                  <div className="font-bold text-white">{inspectingExpense.id}</div>
                </div>
                <div className="bg-[#080a12] p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Total Billed</div>
                  <div className="font-bold text-emerald-400 text-base">
                    ${inspectingExpense.amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-[#080a12] p-3 rounded-lg border border-slate-800 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase">OCR Text Stream:</div>
                <div className="bg-black/60 p-2.5 rounded font-mono text-[11px] text-cyan-200 border border-slate-800/80 leading-relaxed">
                  {inspectingExpense.ocrSnippet}
                  <div className="text-slate-500 text-[10px] mt-2 pt-2 border-t border-slate-800">
                    TAX IDENTIFIER: 94-8219012 // AUTHORIZATION CODE: #AUTH-991204
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span>Account Source: <strong className="text-amber-300">{inspectingExpense.account}</strong></span>
                <span>Date: <strong className="text-white">{inspectingExpense.date}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setInspectingExpense(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Close Inspector [I]
              </button>
              <button
                onClick={() => {
                  setInspectingExpense(null);
                  triggerDecision('right');
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md"
              >
                Approve as Business Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interactive Controls Hint */}
      <div className="relative z-30 w-full px-6 py-2 bg-[#0c0e17]/85 border-t border-slate-800/80 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span><strong className="text-emerald-400">[D / Right]</strong> Approve</span>
          <span><strong className="text-slate-300">[A / Left]</strong> Personal</span>
          <span><strong className="text-red-400">[W / Up]</strong> Dispute</span>
          <span><strong className="text-cyan-300">[Space / Enter]</strong> Auto AI Match</span>
          <span><strong className="text-amber-300">[I]</strong> OCR Inspector</span>
        </div>
        <div>
          <span>Swipe precisely on the beat for <strong>PERFECT TIMING</strong> & Overdrive!</span>
        </div>
      </div>
    </div>
  );
};
