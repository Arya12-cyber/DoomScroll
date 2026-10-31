import React, { useEffect } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import {
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Check,
  X,
  HelpCircle,
  Clock,
  Zap,
} from 'lucide-react';

export const SarathiEscalationModal: React.FC = () => {
  const { activeEscalation, resolveEscalation, dismissEscalation } = useTransactionStore();

  // Keyboard hotkeys [1], [2], [3], [Escape]
  useEffect(() => {
    if (!activeEscalation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && activeEscalation.options[0]) {
        resolveEscalation(activeEscalation.options[0].id);
      } else if (e.key === '2' && activeEscalation.options[1]) {
        resolveEscalation(activeEscalation.options[1].id);
      } else if (e.key === '3' && activeEscalation.options[2]) {
        resolveEscalation(activeEscalation.options[2].id);
      } else if (e.key === 'Escape') {
        dismissEscalation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeEscalation, resolveEscalation, dismissEscalation]);

  if (!activeEscalation) return null;

  const isHighRisk = activeEscalation.riskLevel === 'high';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative max-w-xl w-full bg-[#101422] border-2 border-vedic-gold rounded-3xl p-6 shadow-2xl overflow-hidden jaali-texture text-[#ede5d5]">
        {/* Ornate Gold Trim Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-terracotta-deep via-vedic-gold to-vedic-vermilion" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-vedic-gold/20 font-devanagari">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md border ${
                isHighRisk
                  ? 'bg-red-950/80 border-red-500 text-red-300'
                  : 'bg-amber-950/80 border-amber-500 text-amber-300'
              }`}
            >
              {isHighRisk ? '⚠️' : '🪶'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  सारथि परामर्श // SARATHI CO-PILOT ESCALATION
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-sans border ${
                    isHighRisk
                      ? 'bg-red-950 text-red-300 border-red-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}
                >
                  {activeEscalation.riskLevel.toUpperCase()} RISK
                </span>
              </div>
              <p className="text-xs text-[#cbbda3] font-serif">
                Time-Dilation Sankalpa: The divine charioteer pauses combat to seek your conscious guidance.
              </p>
            </div>
          </div>

          <button
            onClick={dismissEscalation}
            className="p-1.5 rounded-xl bg-[#181b26] hover:bg-[#252836] border border-[#373c52] text-[#cbbda3] hover:text-white transition-all"
            title="Dismiss / Let Time Resume [Esc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Details Card */}
        <div className="my-4 p-4 rounded-2xl bg-[#0c0f1a] border border-vedic-gold/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#cbbda3] font-devanagari font-bold">{activeEscalation.title}</span>
            <div className="flex items-center gap-1 text-vedic-gold-bright">
              <Zap className="w-3.5 h-3.5" />
              <span>AI Confidence: {Math.round(activeEscalation.aiConfidence * 100)}%</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-white font-serif">{activeEscalation.description}</p>
          <p className="text-xs text-[#a89a80] italic font-serif">
            सारथि विश्लेषण: {activeEscalation.reason}
          </p>
        </div>

        {/* Decision Options */}
        <div className="space-y-2.5 my-4 font-devanagari">
          <div className="text-xs font-bold text-[#cbbda3] uppercase tracking-wider font-sans">
            Choose Conscious Action (Press [1], [2], or [3]):
          </div>

          {activeEscalation.options.map((opt, idx) => (
            <button
              key={opt.id}
              onClick={() => resolveEscalation(opt.id)}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all shadow-md active:scale-[0.98] ${
                opt.isRecommended
                  ? 'bg-gradient-to-r from-vedic-gold/25 to-[#1a1715] border-vedic-gold text-white hover:brightness-110 shadow-vedic-gold/20'
                  : 'bg-[#151926] border-[#373c52] text-[#ede5d5] hover:border-vedic-gold/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center font-mono font-bold text-xs text-vedic-gold-bright">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{opt.label}</span>
                    {opt.isRecommended && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-vedic-gold/30 text-vedic-gold-bright border border-vedic-gold font-sans font-bold">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#cbbda3] font-serif">{opt.description}</p>
                </div>
              </div>

              <Check className="w-4 h-4 text-vedic-gold-bright opacity-80" />
            </button>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-vedic-gold/20 flex items-center justify-between text-[11px] text-[#a89a80] font-serif">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-vedic-gold" />
            <span>Gameplay automatically resumes in high gear after your decision.</span>
          </div>
          <span className="font-devanagari text-vedic-gold-bright">कर्मण्येवाधिकारस्ते</span>
        </div>
      </div>
    </div>
  );
};
