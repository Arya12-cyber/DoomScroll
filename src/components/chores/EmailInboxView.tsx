import React, { useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { Mail, Trash2, Archive, Bookmark, RefreshCw, AlertTriangle, CheckCircle, Search, ShieldAlert } from 'lucide-react';

export const EmailInboxView: React.FC = () => {
  const {
    emails,
    trashEmail,
    unsubscribeEmail,
    archiveReceiptEmail,
    bulkNukeEmails,
    liveAccountEmail,
    setMailConnectModalOpen,
    isSyncingGmail,
    syncRealGmail,
  } = useTransactionStore();
  const [filter, setFilter] = useState<'all' | 'spam' | 'newsletter' | 'receipt'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = emails.filter((email) => {
    const matchesFilter = filter === 'all' || email.type === filter;
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = emails.filter((e) => e.status === 'unread').length;
  const trashedCount = emails.filter((e) => e.status === 'trashed').length;
  const archivedCount = emails.filter((e) => e.status === 'archived' || e.status === 'receipt_filed').length;

  return (
    <div className="flex flex-col h-full bg-[#0d101a] text-[#ede5d5] border-2 border-vedic-gold/40 rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Reality Header */}
      <div className="bg-[#131624] p-4 border-b border-vedic-gold/30 flex flex-wrap items-center justify-between gap-3 font-devanagari">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-vedic-gold/15 text-vedic-gold-bright rounded-xl border border-vedic-gold/40">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-vedic-gold-bright tracking-wide flex items-center gap-2">
              अग्नि परीक्षा // GMAIL INBOX PHYSICAL LEDGER
              <span className="text-xs px-2 py-0.5 rounded-full bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40">
                LIVE VAULT
              </span>
            </h2>
            <p className="text-xs text-[#cbbda3] font-serif">
              Unread: <span className="text-red-400 font-semibold">{unreadCount}</span> | Vaporized:{' '}
              <span className="text-emerald-400 font-semibold">{trashedCount}</span> | Archived:{' '}
              <span className="text-purple-400 font-semibold">{archivedCount}</span>
            </p>
          </div>
        </div>

        {/* Connect Real Mail, Sync & Nuke Backlog Actions */}
        <div className="flex items-center gap-2">
          {liveAccountEmail && (
            <button
              onClick={() => syncRealGmail()}
              disabled={isSyncingGmail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0d16] hover:bg-vedic-gold/20 border border-vedic-gold/40 text-vedic-gold-bright rounded-xl text-xs font-devanagari font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Pull latest unread messages from Gmail"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin' : ''}`} />
              <span>पुनः सिंक (Sync Latest)</span>
            </button>
          )}

          <button
            onClick={() => setMailConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-vedic-gold hover:brightness-110 text-slate-950 rounded-xl text-xs font-devanagari font-bold transition-all shadow-md active:scale-95"
            title="Connect your personal Gmail via OAuth 2.0 or CSV import"
          >
            <Mail className="w-3.5 h-3.5 text-slate-900" />
            <span>{liveAccountEmail ? `Connected: ${liveAccountEmail}` : 'Sync Real Gmail (Google Sign-In)'}</span>
          </button>

          <button
            onClick={() => bulkNukeEmails(20)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 rounded-xl text-xs font-devanagari font-bold transition-all shadow-md active:scale-95"
            title="Bulk vaporize 20 backlog emails"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            ब्रह्मास्त्र प्रहार (Vaporize 20)
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-4 py-2.5 bg-[#101420] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {(['all', 'spam', 'newsletter', 'receipt'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded transition-all uppercase ${
                filter === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
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
            placeholder="Search sender, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0d15] border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-[#141824] sticky top-0 border-b border-slate-800 text-slate-400 z-10">
            <tr>
              <th className="py-2.5 px-4 font-semibold">STATUS</th>
              <th className="py-2.5 px-4 font-semibold">SENDER</th>
              <th className="py-2.5 px-4 font-semibold">SUBJECT & PREVIEW</th>
              <th className="py-2.5 px-4 font-semibold">SIZE</th>
              <th className="py-2.5 px-4 font-semibold text-right">MANUAL ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEmails.slice(0, 100).map((email) => {
              const isTrashed = email.status === 'trashed';
              const isArchived = email.status === 'archived';
              const isFiled = email.status === 'receipt_filed';
              const isProcessed = isTrashed || isArchived || isFiled;

              return (
                <tr
                  key={email.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isProcessed ? 'opacity-40 line-through bg-slate-900/40' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {isTrashed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60">
                        <Trash2 className="w-3 h-3" /> TRASHED
                      </span>
                    ) : isArchived ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/60">
                        <Archive className="w-3 h-3" /> ARCHIVED
                      </span>
                    ) : isFiled ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
                        <Bookmark className="w-3 h-3" /> FILED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
                        UNREAD
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap font-medium text-slate-300">
                    <span className="block truncate max-w-[140px]" title={email.sender}>
                      {email.sender}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                      {email.senderEmail}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <p className="font-semibold text-slate-200 truncate max-w-[320px]">{email.subject}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[320px]">{email.preview}</p>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    {email.sizeKb} KB
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap text-right">
                    {!isProcessed && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => trashEmail(email.id)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                          title="Trash Email"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => unsubscribeEmail(email.id)}
                          className="p-1 hover:bg-purple-500/20 text-purple-400 rounded transition-colors"
                          title="Unsubscribe & Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => archiveReceiptEmail(email.id)}
                          className="p-1 hover:bg-amber-500/20 text-amber-400 rounded transition-colors"
                          title="File to Receipts"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
