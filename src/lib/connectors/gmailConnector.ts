/**
 * Gmail REST API & Email File Import Connector
 * 
 * Provides live physical connection to Gmail using OAuth2 Bearer Tokens,
 * as well as zero-cloud-risk CSV/JSON inbox imports.
 */

import { EmailArtifact } from '../../types';

declare global {
  interface Window {
    google?: any;
  }
}

const TOKEN_KEY = 'karmayogi_gmail_token';
const CLIENT_ID_KEY = 'karmayogi_gmail_client_id';
const EMAIL_KEY = 'karmayogi_gmail_user';

export function saveGmailSession(token: string, email: string, clientId?: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
    if (clientId) localStorage.setItem(CLIENT_ID_KEY, clientId);
  } catch {}
}

export function getSavedGmailSession(): { token: string | null; email: string | null; clientId: string | null } {
  try {
    return {
      token: localStorage.getItem(TOKEN_KEY),
      email: localStorage.getItem(EMAIL_KEY),
      clientId: localStorage.getItem(CLIENT_ID_KEY),
    };
  } catch {
    return { token: null, email: null, clientId: null };
  }
}

export function clearGmailSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  } catch {}
}

/**
 * Launch official Google Identity Services OAuth 2.0 Token Client Popup
 */
export function requestGoogleAccessToken(
  clientId: string,
  onSuccess: (token: string) => void,
  onError: (error: any) => void
) {
  if (!window.google?.accounts?.oauth2) {
    onError(new Error('Google Identity Services SDK is loading or blocked by an ad-blocker. Please retry in a few seconds.'));
    return;
  }

  try {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId.trim(),
      scope: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly',
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          onError(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }
        if (tokenResponse.access_token) {
          onSuccess(tokenResponse.access_token);
        } else {
          onError(new Error('No access token received from Google.'));
        }
      },
    });

    client.requestAccessToken();
  } catch (err: any) {
    onError(err);
  }
}

export interface GmailFetchOptions {
  accessToken: string;
  maxResults?: number;
  query?: string;
}

/**
 * Fetch real unread email messages from Gmail REST API
 */
export async function fetchGmailMessages(options: GmailFetchOptions): Promise<{
  accountEmail: string;
  emails: EmailArtifact[];
}> {
  const { accessToken, maxResults = 25, query = 'is:unread' } = options;

  // 1. Fetch user profile
  const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    const errorText = await profileRes.text();
    throw new Error(`Gmail API Profile Error (${profileRes.status}): ${errorText}`);
  }

  const profile = await profileRes.json();
  const accountEmail = profile.emailAddress || 'user@gmail.com';

  // 2. Query messages
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    const errorText = await listRes.text();
    throw new Error(`Gmail API Messages List Error (${listRes.status}): ${errorText}`);
  }

  const listData = await listRes.json();
  const messagesList: { id: string; threadId: string }[] = listData.messages || [];

  // 3. Batch fetch message headers
  const emails: EmailArtifact[] = [];

  for (const item of messagesList.slice(0, maxResults)) {
    try {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!msgRes.ok) continue;

      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];

      const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
      const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
      const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toLocaleDateString();

      // Classify type heuristically
      const isReceipt =
        subjectHeader.toLowerCase().includes('receipt') ||
        subjectHeader.toLowerCase().includes('invoice') ||
        subjectHeader.toLowerCase().includes('payment') ||
        subjectHeader.toLowerCase().includes('order');

      const isNewsletter =
        fromHeader.toLowerCase().includes('newsletter') ||
        fromHeader.toLowerCase().includes('digest') ||
        fromHeader.toLowerCase().includes('weekly') ||
        subjectHeader.toLowerCase().includes('digest');

      const emailType: 'spam' | 'newsletter' | 'receipt' = isReceipt
        ? 'receipt'
        : isNewsletter
        ? 'newsletter'
        : 'spam';

      emails.push({
        id: `gmail-${msgData.id}`,
        sender: fromHeader.split('<')[0].replace(/"/g, '').trim() || fromHeader,
        senderEmail: fromHeader.includes('<') ? fromHeader.split('<')[1].replace('>', '').trim() : fromHeader,
        subject: subjectHeader,
        preview: msgData.snippet || 'Real email from connected Gmail inbox...',
        date: dateHeader,
        sizeKb: Math.max(12, Math.round((msgData.sizeEstimate || 15000) / 1024)),
        type: emailType,
        status: 'unread',
      });
    } catch {
      // Ignore individual message failure
    }
  }

  return { accountEmail, emails };
}

/**
 * Real Gmail Trash Action
 */
export async function trashGmailMessage(accessToken: string, messageId: string): Promise<boolean> {
  const cleanId = messageId.replace('gmail-', '');
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${cleanId}/trash`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.ok;
}

/**
 * Parse CSV format:
 * sender,senderEmail,subject,preview,type,sizeKb
 */
export function parseEmailCsv(csvText: string): EmailArtifact[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const emails: EmailArtifact[] = [];
  const startIndex = lines[0].toLowerCase().includes('subject') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length < 2) continue;

    const sender = cols[0] || 'Unknown Sender';
    const senderEmail = cols[1]?.includes('@') ? cols[1] : `${sender.toLowerCase().replace(/\s+/g, '')}@domain.com`;
    const subject = cols[2] || cols[1] || 'Important Notice';
    const preview = cols[3] || 'Digital clutter artifact pending purification...';
    const rawType = (cols[4] || 'spam').toLowerCase();
    const type: 'spam' | 'newsletter' | 'receipt' =
      rawType.includes('news') ? 'newsletter' : rawType.includes('receipt') ? 'receipt' : 'spam';
    const sizeKb = parseInt(cols[5] || '45', 10) || 45;

    emails.push({
      id: `csv-${Date.now()}-${i}`,
      sender,
      senderEmail,
      subject,
      preview,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sizeKb,
      type,
      status: 'unread',
    });
  }

  return emails;
}

/**
 * Parse JSON format:
 * Array of { sender, subject, senderEmail, type, sizeKb }
 */
export function parseEmailJson(jsonText: string): EmailArtifact[] {
  try {
    const data = JSON.parse(jsonText);
    const list = Array.isArray(data) ? data : data.emails || [];

    return list.map((item: any, i: number) => ({
      id: item.id || `json-${Date.now()}-${i}`,
      sender: item.sender || 'Imported Contact',
      senderEmail: item.senderEmail || 'contact@imported.com',
      subject: item.subject || 'Imported Unread Subject',
      preview: item.preview || item.snippet || 'Imported email artifact...',
      date: item.date || new Date().toLocaleDateString(),
      sizeKb: item.sizeKb || item.size || 50,
      type: item.type === 'newsletter' || item.type === 'receipt' ? item.type : 'spam',
      status: 'unread',
      isVip: !!item.isVip,
    }));
  } catch {
    return [];
  }
}
