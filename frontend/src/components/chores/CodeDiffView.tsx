import React, { useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { Terminal, Check, Bug, GitCommit, FileCode, Wrench, ShieldCheck } from 'lucide-react';

export const CodeDiffView: React.FC = () => {
  const { codeIssues, fixCodeIssue } = useTransactionStore();
  const [activeFileFilter, setActiveFileFilter] = useState<string>('all');

  const fileList = Array.from(new Set(codeIssues.map((c) => c.filePath)));
  const filteredIssues =
    activeFileFilter === 'all'
      ? codeIssues
      : codeIssues.filter((c) => c.filePath === activeFileFilter);

  const unfixedCount = codeIssues.filter((c) => c.status === 'unfixed').length;
  const fixedCount = codeIssues.filter((c) => c.status === 'fixed').length;
  const healthScore = Math.round((fixedCount / (codeIssues.length || 1)) * 100);

  return (
    <div className="flex flex-col h-full bg-[#0d101a] text-[#ede5d5] border-2 border-vedic-gold/40 rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Reality Header */}
      <div className="bg-[#131624] p-4 border-b border-vedic-gold/30 flex flex-wrap items-center justify-between gap-3 font-devanagari">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-vedic-gold/15 text-vedic-gold-bright rounded-xl border border-vedic-gold/40">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-vedic-gold-bright tracking-wide flex items-center gap-2">
              वृत्र व्यूह // AST CODEBASE & SCRIPTURE CLEANSE
              <span className="text-xs px-2 py-0.5 rounded-full bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40 font-mono">
                ESLINT / AST PURGE
              </span>
            </h2>
            <p className="text-xs text-[#cbbda3] font-serif">
              Unresolved Kleshas: <span className="text-red-400 font-semibold">{unfixedCount}</span> | Auto-Slashed:{' '}
              <span className="text-emerald-400 font-semibold">{fixedCount}</span> | Codebase Purity Index:{' '}
              <span className="text-vedic-gold-bright font-semibold">{healthScore}%</span>
            </p>
          </div>
        </div>

        {/* Git Commit Simulation Badge */}
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-[#0a0d16] border border-vedic-gold/30 text-[#cbbda3]">
          <GitCommit className="w-4 h-4 text-vedic-gold-bright" />
          <span>HEAD: chore(ast): purify klesha code smells</span>
        </div>
      </div>

      {/* File Filter Tabs */}
      <div className="px-4 py-2.5 bg-[#0a0d16] border-b border-vedic-gold/20 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveFileFilter('all')}
          className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
            activeFileFilter === 'all'
              ? 'bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40 font-bold'
              : 'text-[#a89a80] hover:text-[#ede5d5] hover:bg-[#131624]'
          }`}
        >
          All Files ({codeIssues.length})
        </button>
        {fileList.map((file) => {
          const count = codeIssues.filter((c) => c.filePath === file && c.status === 'unfixed').length;
          return (
            <button
              key={file}
              onClick={() => setActiveFileFilter(file)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                activeFileFilter === file
                  ? 'bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40 font-bold'
                  : 'text-[#a89a80] hover:text-[#ede5d5] hover:bg-[#131624]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-vedic-gold" />
              <span>{file.split('/').pop()}</span>
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-red-950/80 text-red-300 border border-red-700/60 rounded-full font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Code Diffs List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredIssues.map((issue) => {
          const isFixed = issue.status === 'fixed';

          return (
            <div
              key={issue.id}
              className={`border rounded-xl overflow-hidden font-mono text-xs transition-all shadow-md ${
                isFixed ? 'border-vedic-gold/40 bg-[#0c1611]' : 'border-red-500/40 bg-[#160d10]'
              }`}
            >
              {/* Header Bar */}
              <div className="px-4 py-2 bg-[#131624] border-b border-vedic-gold/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isFixed ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Bug className="w-4 h-4 text-red-400" />
                  )}
                  <span className="font-semibold text-[#ede5d5]">
                    {issue.filePath}:{issue.line}
                  </span>
                  <span className="text-[#a89a80]">({issue.issueType})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#cbbda3] italic">{issue.description}</span>
                  {!isFixed ? (
                    <button
                      onClick={() => fixCodeIssue(issue.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-vedic-gold/20 hover:bg-vedic-gold/30 text-vedic-gold-bright border border-vedic-gold/50 text-[11px] font-bold transition-all shadow active:scale-95"
                    >
                      <Wrench className="w-3 h-3" /> Auto-Fix
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <Check className="w-3.5 h-3.5" /> PURIFIED IN AST
                    </span>
                  )}
                </div>
              </div>

              {/* Diff View */}
              <div className="divide-y divide-vedic-gold/10 text-[11px]">
                {/* Before (Original Error) */}
                <div
                  className={`flex items-start px-4 py-2 ${
                    isFixed ? 'bg-red-950/20 text-red-400/70 line-through' : 'bg-red-950/30 text-red-300'
                  }`}
                >
                  <span className="w-8 select-none text-red-400 font-semibold">- {issue.line}</span>
                  <code className="flex-1 font-mono">{issue.rawSnippet}</code>
                </div>

                {/* After (Fixed Line) */}
                <div
                  className={`flex items-start px-4 py-2 ${
                    isFixed
                      ? 'bg-emerald-950/25 text-emerald-300 font-semibold'
                      : 'bg-[#0a0d16]/70 text-[#a89a80] italic'
                  }`}
                >
                  <span className="w-8 select-none text-emerald-400 font-semibold">+ {issue.line}</span>
                  <code className="flex-1 font-mono">
                    {isFixed ? issue.fixedSnippet : '(Pending Sudarshana / Khanda Slasher Strike...)'}
                  </code>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
