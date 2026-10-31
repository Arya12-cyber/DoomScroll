import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import {
  fetchGmailMessages,
  parseEmailCsv,
  parseEmailJson,
  requestGoogleAccessToken,
  getSavedGmailSession,
} from '../../lib/connectors/gmailConnector';
import {
  Mail,
  Key,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  UploadCloud,
  FileText,
  PlusCircle,
  Sparkles,
  Shield,
  LogIn,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const LiveMailConnectModal: React.FC = () => {
  const {
    isMailConnectModalOpen,
    setMailConnectModalOpen,
    liveAccountEmail,
    gmailAccessToken,
    lastGmailSyncTime,
    isSyncingGmail,
    syncRealGmail,
    connectLiveEmails,
    disconnectLiveEmails,
    addCustomEmail,
    emails,
  } = useTransactionStore();

  const [activeTab, setActiveTab] = useState<'google_popup' | 'oauth_token' | 'simple' | 'file'>('google_popup');

  // Google OAuth Popup State
  const [clientId, setClientId] = useState('');

  // Access Token State
  const [accessToken, setAccessToken] = useState('');
  const [maxResults, setMaxResults] = useState(30);

  // Simple Add Mail Form State
  const [simpleSender, setSimpleSender] = useState('');
  const [simpleSubject, setSimpleSubject] = useState('');
  const [simpleType, setSimpleType] = useState<'spam' | 'newsletter' | 'receipt'>('spam');
  const [simpleIsVip, setSimpleIsVip] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pastedData, setPastedData] = useState('');

  // Load saved client_id from session on mount
  useEffect(() => {
    const session = getSavedGmailSession();
    if (session.clientId) {
      setClientId(session.clientId);
    }
  }, []);

  if (!isMailConnectModalOpen) return null;

  // 1. Official Google Identity Services OAuth Popup
  const handleGoogleSignInPopup = () => {
    if (!clientId.trim()) {
      setErrorMessage('Please provide your Google Cloud OAuth Client ID (e.g. 12345...apps.googleusercontent.com).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    requestGoogleAccessToken(
      clientId.trim(),
      async (token) => {
        try {
          const result = await fetchGmailMessages({
            accessToken: token,
            maxResults,
            query: 'is:unread',
          });

          if (result.emails.length === 0) {
            setErrorMessage('Connected to Google, but no unread messages were found matching "is:unread".');
            setIsLoading(false);
            return;
          }

          connectLiveEmails(result.accountEmail, result.emails, token, clientId.trim());
          setSuccessMessage(`✨ Connected ${result.accountEmail} via Google OAuth! Loaded ${result.emails.length} unread emails.`);
          setIsLoading(false);
          setTimeout(() => {
            setMailConnectModalOpen(false);
          }, 1400);
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to retrieve inbox messages after authorization.');
          setIsLoading(false);
        }
      },
      (error) => {
        setErrorMessage(error.message || 'Google Sign-in was cancelled or encountered an error.');
        setIsLoading(false);
      }
    );
  };

  // 2. Direct Bearer Token Fetch
  const handleFetchGmailWithToken = async () => {
    if (!accessToken.trim()) {
      setErrorMessage('Please provide a valid Google OAuth Access Token.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await fetchGmailMessages({
        accessToken: accessToken.trim(),
        maxResults,
        query: 'is:unread',
      });

      if (result.emails.length === 0) {
        setErrorMessage('No unread messages found matching "is:unread" in connected mailbox.');
        setIsLoading(false);
        return;
      }

      connectLiveEmails(result.accountEmail, result.emails, accessToken.trim());
      setSuccessMessage(`✨ Connected ${result.accountEmail} (${result.emails.length} unread messages loaded).`);
      setTimeout(() => {
        setMailConnectModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate with Gmail REST API.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Simple Add Mail submission
  const handleSimpleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simpleSender.trim() || !simpleSubject.trim()) {
      setErrorMessage('Please enter both sender name and subject.');
      return;
    }

    setErrorMessage(null);
    const created = addCustomEmail({
      sender: simpleSender.trim(),
      subject: simpleSubject.trim(),
      type: simpleType,
      isVip: simpleIsVip,
    });

    setSuccessMessage(`✨ Added "${created.subject.slice(0, 35)}..." to battlefield!`);
    setSimpleSender('');
    setSimpleSubject('');
    setSimpleIsVip(false);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);
  };

  // 1-Click Preset
  const applyPreset = (preset: {
    sender: string;
    subject: string;
    type: 'spam' | 'newsletter' | 'receipt';
    isVip?: boolean;
  }) => {
    setErrorMessage(null);
    const created = addCustomEmail(preset);
    setSuccessMessage(`✨ Added "${created.subject.slice(0, 35)}..." directly to battlefield!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);
  };

  // 4. File / CSV Import
  const handleImportText = () => {
    if (!pastedData.trim()) {
      setErrorMessage('Please paste email data or select a file.');
      return;
    }

    try {
      let parsed = pastedData.trim().startsWith('[') || pastedData.trim().startsWith('{')
        ? parseEmailJson(pastedData)
        : parseEmailCsv(pastedData);

      if (parsed.length === 0) {
        setErrorMessage('Could not parse valid emails. Check format (CSV: sender,email,subject or JSON array).');
        return;
      }

      connectLiveEmails('imported-inbox@local', parsed);
      setSuccessMessage(`✨ Imported ${parsed.length} real email artifacts into live engine!`);
      setTimeout(() => {
        setMailConnectModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse email data.');
    }
  };

  const handleLoadSampleCsv = () => {
    const sample = `Sender,Email,Subject,Snippet,Type,SizeKB
Google Cloud,cloud-noreply@google.com,Your Google Cloud Invoice #GCP-99124,Monthly billing statement for Compute Engine,receipt,120
Stripe Billing,invoices@stripe.com,Receipt for your subscription to Linear,Thank you for your payment of $120.00,receipt,90
Substack Highlights,digest@substack.com,Weekly Tech Deep Dive: Autonomous Agents in 2026,In this issue: Breaking down modern distributed architectures,newsletter,210
Hacker News Top 10,digest@hackernews.io,Show HN: Karmayogi Klesha Slayer,Ask HN: Favorite developer productivity rituals,newsletter,85
Crypto Moon Signals,airdrop@crypto-fast.xyz,CLAIM YOUR $5000 USDT BONUS NOW,Click here immediately to verify your wallet address,spam,45
Cheap Prescriptions,sales@rx-direct-express.biz,80% OFF All Health Supplements Overnight,Clearance stock available for 24 hours only,spam,32`;
    setPastedData(sample);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPastedData(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative max-w-2xl w-full bg-[#101422] border-2 border-vedic-gold rounded-3xl p-6 shadow-2xl overflow-hidden jaali-texture text-[#ede5d5]">
        {/* Ornate Gold Trim Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-terracotta-deep via-vedic-gold to-vedic-vermilion" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-vedic-gold/20 font-devanagari">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-vedic-gold/20 border border-vedic-gold/50 flex items-center justify-center text-2xl shadow-md text-vedic-gold-bright">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  प्रत्यक्ष जीमेल तुल्यकालन // SYNC YOUR REAL GMAIL
                </h3>
                {liveAccountEmail ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600 font-bold font-mono">
                    LIVE CONNECTED
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-vedic-gold/20 text-vedic-gold-bright border border-vedic-gold/40 font-bold font-mono">
                    {emails.length} INBOX ARTIFACTS
                  </span>
                )}
              </div>
              <p className="text-xs text-[#cbbda3] font-serif">
                Authenticate with Google to pull unread emails directly into Agni Pariksha for physical purification.
              </p>
            </div>
          </div>

          <button
            onClick={() => setMailConnectModalOpen(false)}
            className="p-1.5 rounded-xl bg-[#181b26] hover:bg-[#252836] border border-[#373c52] text-[#cbbda3] hover:text-white transition-all"
            title="Close [Esc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Connected Account Banner */}
        {liveAccountEmail && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#0e1612] border border-emerald-500/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm text-white">
                  Active Gmail: {liveAccountEmail}
                </div>
                <div className="text-[11px] text-emerald-400/90 flex items-center gap-2 font-serif">
                  <span>{emails.length} unread artifacts in battlefield</span>
                  {lastGmailSyncTime && (
                    <span className="text-[#a89a80]">
                      • Synced {new Date(lastGmailSyncTime).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => syncRealGmail()}
                disabled={isSyncingGmail}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-400 text-white rounded-xl font-devanagari font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin' : ''}`} />
                <span>पुनः तुल्यकालन (Sync Latest)</span>
              </button>

              <button
                onClick={disconnectLiveEmails}
                className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 rounded-xl font-devanagari font-bold text-xs transition-all active:scale-95"
              >
                विच्छेद (Disconnect)
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-4 border-b border-vedic-gold/20 pb-2 text-xs font-devanagari overflow-x-auto">
          <button
            onClick={() => setActiveTab('google_popup')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'google_popup'
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold shadow-sm'
                : 'text-[#cbbda3] hover:text-white bg-[#181b26] border border-[#373c52]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-vedic-gold" />
            <span>गूगल साइन-इन (Google OAuth Popup)</span>
          </button>

          <button
            onClick={() => setActiveTab('oauth_token')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'oauth_token'
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold shadow-sm'
                : 'text-[#cbbda3] hover:text-white bg-[#181b26] border border-[#373c52]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>टोकन प्रविष्टि (Access Token)</span>
          </button>

          <button
            onClick={() => setActiveTab('simple')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'simple'
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold shadow-sm'
                : 'text-[#cbbda3] hover:text-white bg-[#181b26] border border-[#373c52]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-vedic-gold" />
            <span>सरल प्रविष्टि (Simple Add Mail)</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'file'
                ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold shadow-sm'
                : 'text-[#cbbda3] hover:text-white bg-[#181b26] border border-[#373c52]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>स्थानीय संचय (CSV / JSON Import)</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: GOOGLE IDENTITY SERVICES OAUTH POPUP (PRIMARY) */}
        {activeTab === 'google_popup' && (
          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-bold text-[#cbbda3] mb-1 font-devanagari">
                Google Cloud OAuth 2.0 Client ID:
              </label>
              <input
                type="text"
                placeholder="1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-[#0a0d16] border border-vedic-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-vedic-gold"
              />
              <p className="text-[11px] text-[#a89a80] mt-1 font-serif">
                Saved in your browser's local vault for instant future 1-click syncs.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-[#cbbda3] mb-1 font-devanagari">Unread Batch Size:</label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value, 10))}
                  className="bg-[#0a0d16] border border-vedic-gold/30 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                >
                  <option value={15}>15 Emails (Quick Trial)</option>
                  <option value={30}>30 Emails (Recommended)</option>
                  <option value={60}>60 Emails (Deep Purge)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#cbbda3] font-serif">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Server Storage: Tokens stay 100% in your local browser.</span>
              </div>
            </div>

            {/* Google Sign In Action Button */}
            <button
              onClick={handleGoogleSignInPopup}
              disabled={isLoading || !clientId.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:brightness-110 border border-vedic-gold text-white rounded-2xl font-devanagari font-bold text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Google से संवाद हो रहा है (Connecting to Google)...</span>
                </>
              ) : (
                <>
                  <span className="text-base">🌐</span>
                  <span>गूगल से जुड़ें // Sign in with Google to Sync Real Mail</span>
                </>
              )}
            </button>

            {/* Quick Setup Instructions */}
            <div className="p-3.5 rounded-2xl bg-[#0c0f1a] border border-vedic-gold/20 text-[11px] space-y-1.5 font-serif text-[#cbbda3]">
              <div className="font-bold text-vedic-gold-bright font-devanagari">
                Google Cloud Client ID कहाँ से प्राप्त करें? // How to get Client ID:
              </div>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Open{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 underline inline-flex items-center gap-0.5"
                  >
                    Google Cloud Console Credentials <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application type: <em>Web application</em>).</li>
                <li>Add <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">http://localhost:5173</code> to <strong>Authorized JavaScript origins</strong>.</li>
                <li>Paste the resulting Client ID above and click Sign in with Google!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT ACCESS TOKEN */}
        {activeTab === 'oauth_token' && (
          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-bold text-[#cbbda3] mb-1.5 font-devanagari">
                Google OAuth 2.0 Bearer Access Token:
              </label>
              <input
                type="password"
                placeholder="ya29.a0AfH6SMBx..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full bg-[#0a0d16] border border-vedic-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-vedic-gold"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-[#cbbda3] mb-1 font-devanagari">Batch Size:</label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value, 10))}
                  className="bg-[#0a0d16] border border-vedic-gold/30 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                >
                  <option value={15}>15 Emails</option>
                  <option value={30}>30 Emails (Recommended)</option>
                  <option value={60}>60 Emails</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#cbbda3] font-serif">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ephemeral token runs in client memory.</span>
              </div>
            </div>

            {/* Quick 2-Step Guide */}
            <div className="p-3.5 rounded-2xl bg-[#0c0f1a] border border-vedic-gold/20 text-[11px] space-y-1.5 font-serif text-[#cbbda3]">
              <div className="font-bold text-vedic-gold-bright font-devanagari">
                त्वरित टोकन निर्देश // Get token in 30 seconds via Playground:
              </div>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Open{' '}
                  <a
                    href="https://developers.google.com/oauthplayground"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 underline inline-flex items-center gap-0.5"
                  >
                    Google OAuth Playground <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Select <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">Gmail API v1</code> &gt;{' '}
                  <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">https://www.googleapis.com/auth/gmail.modify</code>
                </li>
                <li>Click <strong>Authorize APIs</strong>, sign in to your Gmail, and copy the <strong>Access token</strong> above.</li>
              </ol>
            </div>

            <button
              onClick={handleFetchGmailWithToken}
              disabled={isLoading || !accessToken.trim()}
              className="w-full py-3 bg-gradient-to-r from-terracotta-deep via-vedic-gold to-terracotta-deep hover:brightness-110 border border-vedic-gold text-white rounded-2xl font-devanagari font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>सिंक्रनाइज़ हो रहा है (Syncing Real Gmail)...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>प्रत्यक्ष संयोजन // Connect & Sync Real Gmail</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: SIMPLE ADD MAIL FORM */}
        {activeTab === 'simple' && (
          <div className="space-y-4 text-xs font-sans">
            <form onSubmit={handleSimpleAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#cbbda3] mb-1 font-devanagari">
                    प्रेषक / From (Sender Name):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LinkedIn, Duolingo, Uber, Substack"
                    value={simpleSender}
                    onChange={(e) => setSimpleSender(e.target.value)}
                    className="w-full bg-[#0a0d16] border border-vedic-gold/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-vedic-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#cbbda3] mb-1 font-devanagari">
                    विषय / Email Subject:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 people viewed your profile today"
                    value={simpleSubject}
                    onChange={(e) => setSimpleSubject(e.target.value)}
                    className="w-full bg-[#0a0d16] border border-vedic-gold/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-vedic-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#cbbda3] mb-1.5 font-devanagari">
                  क्लेश प्रकार / Artifact Target Type:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimpleType('spam')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                      simpleType === 'spam'
                        ? 'bg-red-950/70 border-red-500 text-red-200 shadow-md'
                        : 'bg-[#0a0d16] border-[#373c52] text-[#cbbda3] hover:border-slate-500'
                    }`}
                  >
                    <span className="font-bold font-devanagari flex items-center gap-1 text-xs">
                      🦅 काकासुर (Spam)
                    </span>
                    <span className="text-[10px] text-slate-400 font-serif">Vaporize via Agneyastra</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimpleType('newsletter')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                      simpleType === 'newsletter'
                        ? 'bg-purple-950/70 border-purple-500 text-purple-200 shadow-md'
                        : 'bg-[#0a0d16] border-[#373c52] text-[#cbbda3] hover:border-slate-500'
                    }`}
                  >
                    <span className="font-bold font-devanagari flex items-center gap-1 text-xs">
                      🦗 शलभ (Newsletter)
                    </span>
                    <span className="text-[10px] text-slate-400 font-serif">Unsubscribe via Vayu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimpleType('receipt')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                      simpleType === 'receipt'
                        ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-[#0a0d16] border-[#373c52] text-[#cbbda3] hover:border-slate-500'
                    }`}
                  >
                    <span className="font-bold font-devanagari flex items-center gap-1 text-xs">
                      🕊️ कपोत (Invoice)
                    </span>
                    <span className="text-[10px] text-slate-400 font-serif">Tag via Silk Net</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0d16] border border-vedic-gold/20">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-xs font-devanagari text-white">स्वर्ण कवच (VIP Armor Protection)</span>
                    <p className="text-[10px] text-[#a89a80] font-serif">Weapons ricochet with a temple chime; immune to deletion.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={simpleIsVip}
                  onChange={(e) => setSimpleIsVip(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-terracotta-deep via-vedic-gold to-terracotta-deep hover:brightness-110 border border-vedic-gold text-white rounded-xl font-devanagari font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>⚔️</span>
                <span>रंगभूमि में भेजें // Add To Battlefield</span>
              </button>
            </form>

            <div className="pt-3 border-t border-vedic-gold/20">
              <span className="block text-[11px] font-bold text-[#cbbda3] mb-2 font-devanagari">
                ⚡ त्वरित चयन (1-Click Real World Presets):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    sender: 'LinkedIn Alerts',
                    subject: '5 recruiters searched for your profile this week',
                    type: 'newsletter' as const,
                  },
                  {
                    sender: 'Duolingo Owl',
                    subject: 'Don\'t let Duo cry! 5 minutes for your daily streak',
                    type: 'spam' as const,
                  },
                  {
                    sender: 'DoorDash Delivery',
                    subject: 'We miss you! Take $10 off your dinner',
                    type: 'spam' as const,
                  },
                  {
                    sender: 'AWS Cloud Billing',
                    subject: 'Monthly Cloud Infrastructure Invoice #AWS-99124 ($48.20)',
                    type: 'receipt' as const,
                  },
                  {
                    sender: 'Executive Board',
                    subject: 'CONFIDENTIAL: Q4 Corporate Resolution & Approvals',
                    type: 'newsletter' as const,
                    isVip: true,
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-[#181b26] hover:bg-vedic-gold/20 border border-[#373c52] hover:border-vedic-gold/50 text-[#cbbda3] hover:text-white text-[11px] font-devanagari font-semibold transition-all shadow-sm"
                  >
                    + {preset.sender}: {preset.subject.slice(0, 24)}... {preset.isVip && '🛡️'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FILE / CSV / JSON IMPORT */}
        {activeTab === 'file' && (
          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="flex items-center justify-between mb-1.5 font-devanagari">
                <label className="text-xs font-bold text-[#cbbda3]">
                  Paste CSV or JSON Mailbox Export:
                </label>
                <button
                  onClick={handleLoadSampleCsv}
                  className="text-[11px] text-vedic-gold-bright hover:underline font-bold"
                >
                  Load Sample Real Clutter CSV
                </button>
              </div>

              <textarea
                rows={6}
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder="Sender,Email,Subject,Snippet,Type,SizeKB..."
                className="w-full bg-[#0a0d16] border border-vedic-gold/30 rounded-xl p-3 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-vedic-gold"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-[#181b26] hover:bg-[#252836] border border-[#373c52] rounded-xl text-xs font-bold text-[#ede5d5] transition-all">
                <FileText className="w-4 h-4 text-vedic-gold" />
                <span>Upload .csv / .json File</span>
                <input type="file" accept=".csv,.json,.txt" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleImportText}
                disabled={!pastedData.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-terracotta-deep to-vedic-gold hover:brightness-110 border border-vedic-gold text-white rounded-xl font-devanagari font-bold text-xs transition-all active:scale-95 disabled:opacity-40"
              >
                आयात करें // Import Into Engine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
