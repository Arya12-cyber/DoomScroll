import React, { useState, useEffect, useRef } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { vedicSound } from '../../lib/audio/VedicSoundEngine';
import { ExpenseArtifact } from '../../types';
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Sparkles,
  Building2,
  Scan,
  Volume2,
  VolumeX,
  Flame,
  ChevronRight,
  BookOpen,
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

export const ChitraguptaLedger: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
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
    isSarathiAutopilotEnabled,
    sarathiSpeed,
    triggerEscalation,
    activeEscalation,
  } = useTransactionStore();

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'right' | 'left' | 'up' | null>(null);
  const [isFlinging, setIsFlinging] = useState(false);

  // Mridangam Rhythm & BPM Engine (120 BPM = 500ms per beat)
  const BPM = 120;
  const BEAT_MS = 60000 / BPM;
  const [beatCount, setBeatCount] = useState(0);
  const [beatPhase, setBeatPhase] = useState(0);
  const [playBeatAudio, setPlayBeatAudio] = useState(true);
  const [lastJudgment, setLastJudgment] = useState<{ text: string; color: string; timing: string } | null>(null);
  const [isOverdrive, setIsOverdrive] = useState(false);
  const [overdriveStreak, setOverdriveStreak] = useState(0);
  const [autoPilot, setAutoPilot] = useState(false);

  // Palm-leaf manuscript OCR inspector
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
    autoPilotRef.current = isSarathiAutopilotEnabled || autoPilot;
  }, [isSarathiAutopilotEnabled, autoPilot]);

  useEffect(() => {
    currentCardRef.current = currentCard;
  }, [currentCard]);

  useEffect(() => {
    isFlingingRef.current = isFlinging;
  }, [isFlinging]);

  // 1. High-Precision Mridangam Rhythm Beat Loop
  useEffect(() => {
    vedicSound.init();

    const currentBeatMs = isSarathiAutopilotEnabled ? Math.max(160, BEAT_MS / sarathiSpeed) : BEAT_MS;

    const interval = setInterval(() => {
      const now = Date.now();
      lastBeatTimeRef.current = now;

      setBeatCount((prev) => {
        const next = prev + 1;
        const isDownbeat = next % 4 === 0;

        if (playBeatAudio) {
          if (isDownbeat) {
            vedicSound.playMridangam('bass');
          } else {
            vedicSound.playMridangam('chaapu');
          }
        }

        // Sarathi Autonomous AI Decision on beat
        if (autoPilotRef.current && currentCardRef.current && !isFlingingRef.current && !activeEscalation) {
          const card = currentCardRef.current;

          // Ambiguity Check: trigger human-in-the-loop escalation
          if (card.amount > 150 && card.confidence < 0.80 && Math.random() < 0.12) {
            triggerEscalation({
              id: `esc-exp-${card.id}`,
              title: 'धर्म सन्देह // High-Value Ambiguous Expense',
              description: `Transaction of $${card.amount.toFixed(2)} at "${card.merchant}" (${card.suggestedCategory}).`,
              riskLevel: 'high',
              aiConfidence: card.confidence,
              reason: 'Significant tax classification impact with ambiguous OCR vendor categorization.',
              targetArtifact: card,
              moduleId: 'chitragupta-ledger',
              suggestedActionLabel: 'Approve as Dharma Business',
              options: [
                {
                  id: 'opt-dharma',
                  label: 'धर्म (Dharma Business Expense)',
                  description: 'Classify as legitimate corporate deduction.',
                  isRecommended: true,
                  actionType: 'approve',
                },
                {
                  id: 'opt-kama',
                  label: 'काम / मोह (Personal Expense)',
                  description: 'Exclude from corporate audit and flag as personal.',
                  actionType: 'reject',
                },
                {
                  id: 'opt-vivada',
                  label: 'विवाद (Dispute / Split)',
                  description: 'Flag for line-item receipt breakdown.',
                  actionType: 'divert',
                },
              ],
            });
            return next;
          }

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

      setBeatPhase(1);
      setTimeout(() => setBeatPhase(0), 180);
    }, currentBeatMs);

    return () => clearInterval(interval);
  }, [playBeatAudio, isSarathiAutopilotEnabled, sarathiSpeed, activeEscalation]);

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
      const speed = 2 + Math.random() * 5.5;
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

  // 2. Rhythm Precision Timing Judgment
  const judgeTiming = (): { judgment: string; multiplier: number; color: string } => {
    const now = Date.now();
    const timeSinceLast = now - lastBeatTimeRef.current;
    const delta = Math.min(timeSinceLast, BEAT_MS - timeSinceLast);

    if (delta <= 75) {
      vedicSound.playTempleBell(1.4, 2.0);
      setOverdriveStreak((prev) => {
        const next = prev + 1;
        if (next >= 4 && !isOverdrive) {
          setIsOverdrive(true);
          vedicSound.playBansuriFanfare();
        }
        return next;
      });
      return { judgment: '🔥 शुद्ध समय! (PERFECT BEAT x2)', multiplier: 2.0, color: '#f59e0b' };
    } else if (delta <= 140) {
      return { judgment: '⚡ उत्तम समय! (GREAT TIMING)', multiplier: 1.5, color: '#38bdf8' };
    } else {
      setOverdriveStreak(0);
      setIsOverdrive(false);
      return { judgment: 'अताल (OFF-BEAT)', multiplier: 1.0, color: '#94a3b8' };
    }
  };

  // 3. Execution of Chore Decision (Dharma / Kama / Vivada)
  const triggerDecision = (direction: 'right' | 'left' | 'up') => {
    if (!currentCard || isFlinging || isFlingingRef.current) return;

    setIsFlinging(true);
    isFlingingRef.current = true;
    setSwipeDirection(direction);

    const timing = judgeTiming();
    setLastJudgment({
      text: timing.judgment,
      color: timing.color,
      timing: `${Math.round(timing.multiplier * 100)}% Sync`,
    });

    const targetX = direction === 'right' ? 800 : direction === 'left' ? -800 : 0;
    const targetY = direction === 'up' ? -700 : dragOffset.y;
    setDragOffset({ x: targetX, y: targetY });

    const cardCenterX = window.innerWidth / 2;
    const cardCenterY = window.innerHeight / 2;

    setTimeout(() => {
      const baseScore = direction === 'up' ? 500 : direction === 'right' ? 350 : 200;
      const overdriveMultiplier = isOverdrive ? 2.5 : 1;
      const finalScore = Math.round(baseScore * timing.multiplier * overdriveMultiplier);

      if (direction === 'right') {
        vedicSound.playPunyaChime();
        addParticles(cardCenterX + 200, cardCenterY, '#22c55e', 24);
        approveBusinessExpense(currentCard.id);
      } else if (direction === 'left') {
        vedicSound.playMridangam('dheem');
        addParticles(cardCenterX - 200, cardCenterY, '#94a3b8', 16);
        flagPersonalExpense(currentCard.id);
      } else if (direction === 'up') {
        vedicSound.playDamaruStrike();
        addParticles(cardCenterX, cardCenterY - 200, '#dc2626', 28);
        disputeExpense(currentCard.id);
      }

      addScore(finalScore);
      incrementCombo();

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
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const rotationDeg = (dragOffset.x / 14) * 0.75;

  return (
    <div className="relative w-full h-full bg-[#0a0c16] flex flex-col items-center justify-between overflow-hidden select-none font-sans text-[#ede5d5] jaali-texture">
      {/* Warm Ambient Temple Glow */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          isOverdrive
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-vedic-gold/25 via-terracotta-deep/20 to-[#0a0c16]'
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#181b26]/50 via-[#0a0c16] to-[#050609]'
        }`}
      />

      {/* Overdrive Golden Temple Aura */}
      {isOverdrive && (
        <div className="absolute inset-0 border-4 border-vedic-gold/70 pointer-events-none shadow-[inset_0_0_60px_rgba(217,119,6,0.35)] animate-pulse z-20" />
      )}

      {/* Top HUD */}
      <div className="relative z-30 w-full px-4 sm:px-6 pt-3 flex items-center justify-between text-xs font-devanagari">
        {/* Left: Score & Audited Amount */}
        <div className="flex items-center gap-3 bg-[#131622]/90 border border-vedic-gold/50 backdrop-blur-md px-4 py-2 rounded-2xl shadow-vedic-gold">
          <button
            onClick={onBackToHub}
            className="p-1 hover:bg-vedic-gold/20 text-vedic-gold-bright rounded-xl transition-colors"
            title="Return to Mandapa Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-vedic-gold tracking-widest font-bold">
              अध्याय ३ // चित्रगुप्त लेखा (EXPENSE AUDIT)
            </div>
            <div className="text-sm font-extrabold text-white">
              पुण्य: {stats.karmaPoints.toLocaleString()}
            </div>
          </div>
          <div className="h-6 w-px bg-vedic-gold/30" />
          <div>
            <div className="text-[10px] text-[#cbbda3]">धर्म व्यय (Deductible)</div>
            <div className="text-sm font-bold text-emerald-400">
              ${stats.dollarsAudited.toFixed(2)}
            </div>
          </div>
          <div className="h-6 w-px bg-vedic-gold/30" />
          <div>
            <div className="text-[10px] text-[#cbbda3]">अनिर्णीत लेखा</div>
            <div className="text-sm font-bold text-amber-300">
              {pendingExpenses.length} Items
            </div>
          </div>
        </div>

        {/* Center: Tapasya Overdrive */}
        <div className="flex items-center gap-3">
          {isOverdrive ? (
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-vedic-gold to-yellow-500 text-slate-950 font-black text-xs shadow-vedic-gold animate-bounce">
              <Flame className="w-4 h-4 fill-current text-red-600" />
              <span>महातपस्या गुणक x{stats.combo}</span>
            </div>
          ) : stats.combo > 1 ? (
            <div className="bg-gradient-to-r from-terracotta-deep to-vedic-gold border border-vedic-gold px-3.5 py-1.5 rounded-full text-white font-bold animate-pulse shadow-vedic-gold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-vedic-gold-bright fill-vedic-gold-bright" />
              <span>तपस्या x{stats.combo}</span>
            </div>
          ) : null}
        </div>

        {/* Right Controls: Auto-Pilot, Mridangam Beat & Reality Ledger */}
        <div className="flex items-center gap-2">
          {/* Dharmic Auto-Pilot Bot Toggle */}
          <button
            onClick={() => setAutoPilot((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
              autoPilot
                ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/20 text-emerald-300 border-emerald-400 shadow-md animate-pulse'
                : 'bg-[#181b26]/90 text-[#cbbda3] border-[#373c52] hover:text-white'
            }`}
            title="Toggle Dharmic Auto-Pilot Rhythm Classifier"
          >
            <Sparkles className={`w-3.5 h-3.5 ${autoPilot ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500'}`} />
            <span>धर्म-बॉट: {autoPilot ? 'सक्रिय' : 'बंद'}</span>
          </button>

          {/* Mridangam Beat Ticker */}
          <button
            onClick={() => setPlayBeatAudio((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
              playBeatAudio
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border-vedic-gold shadow-vedic-gold'
                : 'bg-[#181b26]/90 text-[#cbbda3] border-[#373c52]'
            }`}
            title="Toggle 120 BPM Mridangam Heartbeat Audio"
          >
            {playBeatAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>मृदङ्गम्: {playBeatAudio ? '१२० BPM' : 'शांत'}</span>
          </button>

          {/* Reality Lens */}
          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-terracotta-deep to-[#7c2d12] hover:from-[#9a3412] hover:to-terracotta-deep border border-vedic-gold/60 text-vedic-gold-bright rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>प्रत्यक्ष बही [Tab]</span>
          </button>
        </div>
      </div>

      {/* RHYTHM HIGHWAY TICKER */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-4 mt-2">
        <div className="bg-[#121522]/90 border border-vedic-gold/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] text-[#cbbda3] font-bold uppercase mb-1.5 px-1 font-devanagari">
            <span className="flex items-center gap-1 text-vedic-gold-bright">
              <Sparkles className="w-3 h-3" />
              मृदङ्गम् ताल मार्ग (120 BPM)
            </span>
            <span>
              {lastJudgment ? (
                <span style={{ color: lastJudgment.color }} className="font-extrabold animate-pulse">
                  {lastJudgment.text}
                </span>
              ) : (
                'ताल संरेखण (Match the beat!)'
              )}
            </span>
          </div>

          {/* Glowing rhythm pulse track */}
          <div className="relative h-3 w-full bg-[#080a14] rounded-full overflow-hidden border border-vedic-gold/30">
            <div
              className={`h-full w-full transition-all duration-75 rounded-full ${
                beatPhase === 1 ? 'bg-gradient-to-r from-vedic-gold via-yellow-400 to-vedic-gold opacity-100' : 'opacity-25 bg-vedic-gold'
              }`}
            />
          </div>
        </div>
      </div>

      {/* PALM-LEAF CARD DECK */}
      <div className="relative z-20 flex-1 flex items-center justify-center w-full max-w-md px-4 my-auto">
        {currentCard ? (
          <div className="relative w-full aspect-[4/5] max-h-[460px]">
            {/* Background stack depth cards */}
            {nextCards.map((nextCard, idx) => (
              <div
                key={nextCard.id}
                className="absolute inset-0 rounded-3xl bg-[#161a29] border-2 border-vedic-gold/30 shadow-xl transition-all duration-300 pointer-events-none"
                style={{
                  transform: `translateY(${(idx + 1) * 12}px) scale(${1 - (idx + 1) * 0.05})`,
                  opacity: 0.7 - idx * 0.2,
                  zIndex: 10 - idx,
                }}
              />
            ))}

            {/* Top Playable Palm-Leaf Manuscript Card */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`absolute inset-0 rounded-3xl bg-gradient-to-b from-[#1c2030] to-[#10131e] border-2 border-vedic-gold/60 p-6 flex flex-col justify-between shadow-2xl cursor-grab active:cursor-grabbing touch-none z-20 transition-transform ${
                isFlinging ? 'duration-200 ease-out' : 'duration-75'
              }`}
              style={{
                transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0px) rotate(${rotationDeg}deg)`,
              }}
            >
              {/* Dynamic Watermark Stamp Overlay */}
              {swipeDirection === 'right' && (
                <div className="absolute top-10 left-6 border-4 border-emerald-400 text-emerald-400 font-devanagari font-black text-2xl px-4 py-1.5 rounded-2xl -rotate-12 bg-emerald-950/90 tracking-wider shadow-2xl animate-bounce">
                  धर्म व्यय (APPROVED)
                </div>
              )}
              {swipeDirection === 'left' && (
                <div className="absolute top-10 right-6 border-4 border-slate-400 text-slate-300 font-devanagari font-black text-2xl px-4 py-1.5 rounded-2xl rotate-12 bg-slate-900/90 tracking-wider shadow-2xl">
                  काम / मोह (PERSONAL)
                </div>
              )}
              {swipeDirection === 'up' && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 border-4 border-red-500 text-red-400 font-devanagari font-black text-xl px-4 py-1 rounded-2xl bg-red-950/90 tracking-wider shadow-2xl">
                  विवाद (DISPUTED)
                </div>
              )}

              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#cbbda3] mb-2 font-serif">
                  <span className="flex items-center gap-1.5 text-vedic-gold-bright font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    {currentCard.account}
                  </span>
                  <span className="text-slate-400">{currentCard.date}</span>
                </div>

                {/* Big Price Line */}
                <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1 my-2">
                  <span className="text-2xl text-vedic-gold-bright font-normal">$</span>
                  {currentCard.amount.toFixed(2)}
                </div>

                <h3 className="text-lg font-bold text-[#ede5d5] truncate" title={currentCard.merchant}>
                  {currentCard.merchant}
                </h3>
              </div>

              {/* Palm-Leaf OCR & Category Box */}
              <div className="my-3 bg-[#0a0d16]/90 border border-vedic-gold/40 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#cbbda3]">अनुशंसित श्रेणी (Category):</span>
                  <span className="text-sky-300 font-bold bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-sky-800">
                    {currentCard.suggestedCategory}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#cbbda3]">चित्रगुप्त प्रामाणिकता (Confidence):</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(currentCard.confidence * 100)}% Verified
                  </span>
                </div>

                {/* OCR Receipt Snippet */}
                <div className="pt-2 border-t border-vedic-gold/20">
                  <div className="flex items-center justify-between text-[11px] text-[#cbbda3] mb-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-vedic-gold-bright" />
                      ताम्रपत्र रसीद (OCR RECEIPT):
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingExpense(currentCard);
                      }}
                      className="text-vedic-gold-bright hover:text-white flex items-center gap-0.5 text-[11px] font-bold"
                    >
                      निरीक्षण <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#ede5d5] italic font-serif bg-black/50 p-2 rounded-xl border border-vedic-gold/30 line-clamp-2">
                    "{currentCard.ocrSnippet}"
                  </p>
                </div>
              </div>

              {/* Bottom Card Controls Helper */}
              <div className="pt-2 border-t border-vedic-gold/20 flex items-center justify-between text-[11px] font-devanagari">
                <span className="text-slate-400">← [A] काम (Personal)</span>
                <span className="text-red-400 font-semibold">↑ [W] विवाद</span>
                <span className="text-emerald-400 font-semibold">[D] धर्म (Business) →</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-[#131622] border-2 border-vedic-gold/50 rounded-3xl shadow-vedic-gold max-w-sm">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2 font-devanagari">लेखा परीक्षण सम्पूर्णम्</h3>
            <p className="text-xs text-[#cbbda3] mb-5 font-serif">
              All financial deeds have been weighed and balanced in Chitragupta’s cosmic ledger.
            </p>
            <button
              onClick={onBackToHub}
              className="px-5 py-2.5 bg-gradient-to-r from-terracotta-deep to-vedic-gold text-white font-devanagari font-black rounded-xl text-xs transition-all shadow-lg active:scale-95"
            >
              मण्डप वापसी (Return to Hub)
            </button>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTONS */}
      {currentCard && (
        <div className="relative z-30 flex items-center gap-4 mb-3 font-devanagari">
          {/* Left: Moha/Personal */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => triggerDecision('left')}
              className="w-14 h-14 rounded-full bg-[#181b26] border-2 border-slate-600 hover:border-slate-300 text-slate-300 flex items-center justify-center transition-all shadow-lg active:scale-90"
              title="Flag as Personal Expense [A / Left Arrow]"
            >
              <XCircle className="w-6 h-6 text-slate-400" />
            </button>
            <span className="text-[10px] text-slate-400 font-bold tracking-tight">[A] काम / मोह</span>
          </div>

          {/* Center-Left: Dispute */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => triggerDecision('up')}
              className="w-12 h-12 rounded-full bg-red-950 border-2 border-red-500 hover:border-red-400 text-red-300 flex items-center justify-center transition-all shadow-md active:scale-90"
              title="Dispute / Split Ticket [W / Up Arrow]"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
            </button>
            <span className="text-[10px] text-red-400 font-bold tracking-tight">[W] विवाद</span>
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
              className="px-4 h-12 rounded-full bg-vedic-gold/30 border-2 border-vedic-gold hover:border-vedic-gold-bright text-vedic-gold-bright flex items-center gap-1.5 transition-all shadow-vedic-gold active:scale-90 font-bold text-xs"
              title="Auto Classify with AI Confidence [Space / Enter]"
            >
              <Zap className="w-4 h-4 text-vedic-gold-bright fill-vedic-gold-bright" />
              <span>धर्म निर्णय</span>
            </button>
            <span className="text-[10px] text-vedic-gold-bright font-bold tracking-tight">[SPACE] AI</span>
          </div>

          {/* Right: Business */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => triggerDecision('right')}
              className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-emerald-400 hover:border-emerald-300 text-emerald-300 flex items-center justify-center transition-all shadow-md active:scale-90"
              title="Approve Business Expense [D / Right Arrow]"
            >
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </button>
            <span className="text-[10px] text-emerald-400 font-bold tracking-tight">[D] धर्म व्यय</span>
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

      {/* PALM-LEAF OCR INSPECTOR MODAL */}
      {inspectingExpense && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121522] border-2 border-vedic-gold rounded-3xl p-6 shadow-vedic-gold relative animate-in fade-in zoom-in-95 font-devanagari">
            <div className="flex items-center justify-between pb-3 border-b border-vedic-gold/30">
              <div className="flex items-center gap-2 text-vedic-gold-bright font-bold text-sm">
                <Scan className="w-4 h-4 text-vedic-gold-bright" />
                <span>चित्रगुप्त पत्र निरीक्षण // {inspectingExpense.merchant}</span>
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
                <div className="bg-[#080a14] p-3 rounded-xl border border-vedic-gold/30">
                  <div className="text-[10px] text-[#cbbda3]">लेखा क्रमांक (TX ID)</div>
                  <div className="font-bold text-white">{inspectingExpense.id}</div>
                </div>
                <div className="bg-[#080a14] p-3 rounded-xl border border-vedic-gold/30">
                  <div className="text-[10px] text-[#cbbda3]">कुल मुद्रा (Total Amount)</div>
                  <div className="font-bold text-emerald-400 text-base">
                    ${inspectingExpense.amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-[#080a14] p-3.5 rounded-xl border border-vedic-gold/30 space-y-1.5 font-serif">
                <div className="text-[10px] text-vedic-gold-bright font-bold uppercase">OCR DIGITAL RECEIPT:</div>
                <div className="bg-black/60 p-3 rounded-xl text-[11px] text-[#ede5d5] border border-vedic-gold/20 leading-relaxed italic">
                  "{inspectingExpense.ocrSnippet}"
                  <div className="text-[#a89980] text-[10px] mt-2 pt-2 border-t border-vedic-gold/20">
                    TAX IDENTIFIER: 94-8219012 // AUTHORIZATION CODE: #AUTH-991204
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1 text-[#cbbda3] font-serif">
                <span>Account Source: <strong className="text-vedic-gold-bright">{inspectingExpense.account}</strong></span>
                <span>Date: <strong className="text-white">{inspectingExpense.date}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-vedic-gold/30">
              <button
                onClick={() => setInspectingExpense(null)}
                className="px-4 py-2 bg-[#181b26] hover:bg-[#252836] text-[#ede5d5] rounded-xl text-xs"
              >
                बंद करें [I]
              </button>
              <button
                onClick={() => {
                  setInspectingExpense(null);
                  triggerDecision('right');
                }}
                className="px-4 py-2 bg-gradient-to-r from-terracotta-deep to-vedic-gold hover:from-vedic-gold hover:to-terracotta-deep text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                धर्म व्यय स्वीकारें (Approve)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interactive Controls Hint */}
      <div className="relative z-30 w-full px-6 py-2 bg-[#0c0e17]/85 border-t border-vedic-gold/30 backdrop-blur-md flex items-center justify-between text-[11px] text-[#cbbda3] font-devanagari">
        <div className="flex items-center gap-4">
          <span><strong className="text-emerald-400">[D / Right]</strong> धर्म व्यय</span>
          <span><strong className="text-slate-300">[A / Left]</strong> काम / मोह</span>
          <span><strong className="text-red-400">[W / Up]</strong> विवाद</span>
          <span><strong className="text-vedic-gold-bright">[Space / Enter]</strong> धर्म निर्णय</span>
          <span><strong className="text-amber-300">[I]</strong> पत्र निरीक्षण</span>
        </div>
        <div>
          <span>Swipe precisely on the beat for <strong>शुद्ध समय!</strong> & Overdrive!</span>
        </div>
      </div>
    </div>
  );
};
