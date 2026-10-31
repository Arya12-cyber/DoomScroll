import React, { useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { DollarSign, CheckCircle, XCircle, AlertCircle, FileCheck, Receipt, Search, Building2 } from 'lucide-react';

export const ExpenseAuditView: React.FC = () => {
  const { expenses, approveBusinessExpense, flagPersonalExpense, disputeExpense } = useTransactionStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'personal' | 'disputed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses.filter((exp) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && exp.status === 'pending_review') ||
      (filter === 'approved' && exp.status === 'business_approved') ||
      (filter === 'personal' && exp.status === 'personal_flagged') ||
      (filter === 'disputed' && exp.status === 'disputed');

    const matchesSearch =
      exp.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.suggestedCategory.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalAuditedDollars = expenses
    .filter((e) => e.status === 'business_approved')
    .reduce((acc, e) => acc + e.amount, 0);

  const pendingDollars = expenses
    .filter((e) => e.status === 'pending_review')
    .reduce((acc, e) => acc + e.amount, 0);

  const personalDollars = expenses
    .filter((e) => e.status === 'personal_flagged')
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="flex flex-col h-full bg-[#0d101a] text-[#ede5d5] border-2 border-vedic-gold/40 rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Reality Header */}
      <div className="bg-[#131624] p-4 border-b border-vedic-gold/30 flex flex-wrap items-center justify-between gap-3 font-devanagari">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-vedic-gold/15 text-vedic-gold-bright rounded-xl border border-vedic-gold/40">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-vedic-gold-bright tracking-wide flex items-center gap-2">
              चित्रगुप्त लेखा // PLAID & CSV EXPENSE LEDGER
              <span className="text-xs px-2 py-0.5 rounded-full bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40 font-sans font-bold">
                TAX AUDIT
              </span>
            </h2>
            <p className="text-xs text-[#cbbda3] font-serif">
              Tax Deductible: <span className="text-emerald-400 font-semibold">\${totalAuditedDollars.toFixed(2)}</span> | Personal Excluded:{' '}
              <span className="text-slate-400 font-semibold">\${personalDollars.toFixed(2)}</span> | Pending Audit:{' '}
              <span className="text-amber-400 font-semibold">\${pendingDollars.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-4 py-2.5 bg-[#101420] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {(['all', 'pending', 'approved', 'personal', 'disputed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded transition-all uppercase ${
                filter === tab
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search merchant or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0d15] border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-[#141824] sticky top-0 border-b border-slate-800 text-slate-400 z-10">
            <tr>
              <th className="py-2.5 px-4 font-semibold">STATUS</th>
              <th className="py-2.5 px-4 font-semibold">MERCHANT & OCR</th>
              <th className="py-2.5 px-4 font-semibold">AMOUNT</th>
              <th className="py-2.5 px-4 font-semibold">SUGGESTED CATEGORY</th>
              <th className="py-2.5 px-4 font-semibold">ACCOUNT</th>
              <th className="py-2.5 px-4 font-semibold text-right">AUDIT ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredExpenses.map((exp) => {
              const isApproved = exp.status === 'business_approved';
              const isPersonal = exp.status === 'personal_flagged';
              const isDisputed = exp.status === 'disputed';
              const isPending = exp.status === 'pending_review';

              return (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <CheckCircle className="w-3 h-3" /> BUSINESS
                      </span>
                    ) : isPersonal ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                        <XCircle className="w-3 h-3" /> PERSONAL
                      </span>
                    ) : isDisputed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                        <AlertCircle className="w-3 h-3" /> DISPUTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <p className="font-semibold text-slate-200">{exp.merchant}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[280px]">
                      OCR: "{exp.ocrSnippet}"
                    </p>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap font-bold text-slate-100">
                    \${exp.amount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {exp.suggestedCategory}
                    </span>
                    {exp.receiptMatched && (
                      <span className="ml-1 text-[10px] text-emerald-400 inline-flex items-center gap-0.5">
                        <FileCheck className="w-3 h-3" /> Receipt
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    {exp.account}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    {isPending ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => approveBusinessExpense(exp.id)}
                          className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold transition-colors"
                          title="Approve Business Expense"
                        >
                          Approve (→)
                        </button>
                        <button
                          onClick={() => flagPersonalExpense(exp.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-[10px] transition-colors"
                          title="Flag as Personal"
                        >
                          Personal (←)
                        </button>
                        <button
                          onClick={() => disputeExpense(exp.id)}
                          className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded text-[10px] transition-colors"
                          title="Dispute / Split"
                        >
                          Dispute (↑)
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">Reconciled</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
