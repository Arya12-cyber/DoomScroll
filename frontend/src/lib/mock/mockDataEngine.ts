import {
  EmailArtifact,
  FileArtifact,
  ExpenseArtifact,
  CodeIssueArtifact,
} from '../../types';

// Procedural generator that creates 500+ realistic items across the 4 modules

export function generateMockEmails(): EmailArtifact[] {
  const emails: EmailArtifact[] = [];

  const spamSenders = [
    { sender: 'Crypto Alpha Signals', domain: 'pump-signals-vip.xyz', subjects: ['🔥 Claim your 25,000 $SHADOW airdrop now!', 'Your wallet is eligible for 5 ETH bounty'] },
    { sender: 'Luxury Rewards Hub', domain: 'promo-deals-claim.online', subjects: ['Confirm your $500 Amazon Gift Card balance', 'You won 1st prize in our weekly sweepstakes'] },
    { sender: 'Weight Loss Miracle', domain: 'get-fit-fast-today.co', subjects: ['Doctor reveals 1 bedtime trick to melt 15 lbs', 'Ancient Himalayan tea secret'] },
    { sender: 'Urgent Account Verification', domain: 'security-alert-center-update.info', subjects: ['CRITICAL: Account suspension in 24 hours', 'Unusual login attempt from Vladivostok, RU'] },
    { sender: 'Cheap Meds Express', domain: 'rx-direct-pharma.biz', subjects: ['Discount prescriptions delivered overnight - 80% OFF', 'Generic health care stock clearance'] },
    { sender: 'Fast Cash Loans', domain: 'instant-approval-loans.net', subjects: ['Pre-approved for $25,000 personal loan - No credit check', 'Funds waiting to be deposited today'] }
  ];

  const newsletterSenders = [
    { sender: 'TLDR Tech & AI', domain: 'tldr.tech', subjects: ['DeepMind releases Gemini 3.5, OpenAI counters', 'Anthropic introduces autonomous computer use'] },
    { sender: 'The Pragmatic Engineer', domain: 'pragmaticengineer.com', subjects: ['Inside Big Tech Compensation Bands (2026 Edition)', 'Why Engineering Teams Are Ditching Microservices'] },
    { sender: 'ByteByteGo System Design', domain: 'bytebytego.com', subjects: ['How Discord stores trillions of messages', 'Kafka vs RabbitMQ architecture teardown'] },
    { sender: 'Figma Community Roundup', domain: 'figma.com', subjects: ['10 Design System UI kits you need to check out', 'Config 2026 Keynote Announcement'] },
    { sender: 'Product Hunt Daily', domain: 'producthunt.com', subjects: ['Top 10 AI productivity tools launched today', 'The #1 Product of the Week is...'] },
    { sender: 'Hacker News Digest', domain: 'hackernewsdigest.io', subjects: ['Ask HN: What is your favorite obscure CLI tool?', 'Show HN: A rogue-lite that cleans your computer'] },
    { sender: 'Next.js & React Weekly', domain: 'reactnewsletter.com', subjects: ['React 19 Server Actions deep dive', 'Turbopack is now 10x faster in v15.2'] }
  ];

  const receiptSenders = [
    { sender: 'GitHub Billing', domain: 'github.com', subjects: ['Your GitHub Enterprise invoice #INV-98231 is ready', 'Payment confirmed for GitHub Copilot Business'] },
    { sender: 'Amazon Web Services', domain: 'amazonaws.com', subjects: ['Amazon Web Services Invoice [Account: 8812-4912-0091]', 'AWS Cloud Billing - Monthly Charges ($342.18)'] },
    { sender: 'Stripe Merchant Support', domain: 'stripe.com', subjects: ['Payout of $4,850.00 is on its way to your bank', 'Your monthly Stripe processing fee receipt'] },
    { sender: 'Apple Services', domain: 'apple.com', subjects: ['Your receipt from Apple: iCloud+ 2TB Storage Plan', 'Apple Developer Program Annual Membership Renewal'] },
    { sender: 'Uber Receipts', domain: 'uber.com', subjects: ['Your Friday evening trip with Uber ($34.12)', 'Uber Eats: Order from Sushi Omakase ($58.40)'] },
    { sender: 'Google Cloud Platform', domain: 'google.com', subjects: ['Google Cloud Platform Monthly Statement #GCP-049182', 'Vertex AI API Usage for October 2026'] }
  ];

  let idCounter = 1;

  // 1. Generate 70 Spam Emails
  for (let i = 0; i < 70; i++) {
    const s = spamSenders[i % spamSenders.length];
    const subj = s.subjects[i % s.subjects.length];
    emails.push({
      id: `email-spam-${idCounter++}`,
      sender: s.sender,
      senderEmail: `support@${s.domain}`,
      subject: `${subj} [#${1000 + i}]`,
      preview: 'Click here immediately to verify your identity and secure your credits before they expire...',
      date: `Oct ${Math.max(1, 31 - (i % 25))}, 2026`,
      sizeKb: 14 + (i * 7) % 60,
      type: 'spam',
      status: 'unread',
    });
  }

  // 2. Generate 50 Newsletter Emails
  for (let i = 0; i < 50; i++) {
    const s = newsletterSenders[i % newsletterSenders.length];
    const subj = s.subjects[i % s.subjects.length];
    emails.push({
      id: `email-news-${idCounter++}`,
      sender: s.sender,
      senderEmail: `newsletter@${s.domain}`,
      subject: subj,
      preview: 'In this issue: Breaking down modern distributed architectures, performance profiling in production...',
      date: `Oct ${Math.max(1, 30 - (i % 28))}, 2026`,
      sizeKb: 45 + (i * 12) % 150,
      type: 'newsletter',
      status: 'unread',
      unsubscribeUrl: `https://${s.domain}/unsubscribe?token=mock_${i}`,
    });
  }

  // 3. Generate 30 Receipt Emails
  for (let i = 0; i < 30; i++) {
    const s = receiptSenders[i % receiptSenders.length];
    const subj = s.subjects[i % s.subjects.length];
    emails.push({
      id: `email-rcpt-${idCounter++}`,
      sender: s.sender,
      senderEmail: `billing@${s.domain}`,
      subject: subj,
      preview: 'Thank you for your payment. Please find the attached itemized tax invoice for your records...',
      date: `Oct ${Math.max(1, 31 - (i % 20))}, 2026`,
      sizeKb: 80 + (i * 15) % 250,
      type: 'receipt',
      status: 'unread',
    });
  }

  // 4. Inject Golden Kavacha VIP Emails (Protected from Weapons)
  emails.push(
    {
      id: `email-vip-1`,
      sender: 'Board of Directors & Counsel',
      senderEmail: 'board@karmayogi.corp',
      subject: 'URGENT: Executive Term Sheet & Board Approvals [CONFIDENTIAL]',
      preview: 'Please find attached the signed board resolution approving Q4 strategic investments...',
      date: 'Oct 31, 2026',
      sizeKb: 145,
      type: 'newsletter',
      status: 'unread',
      isVip: true,
      vipReason: 'Executive & Board of Directors (Protected by Kavacha)',
      kavachaActive: true,
    },
    {
      id: `email-vip-2`,
      sender: 'Lead Patent Attorney',
      senderEmail: 'counsel@patentlaw.global',
      subject: 'Filing Receipt: Quantum Neural AST Patent Application #US-98124',
      preview: 'Official USPTO patent submission timestamp receipt. Preserve all correspondence...',
      date: 'Oct 30, 2026',
      sizeKb: 312,
      type: 'receipt',
      status: 'unread',
      isVip: true,
      vipReason: 'Legal Patent Compliance (Protected by Kavacha)',
      kavachaActive: true,
    }
  );

  return emails;
}

export function generateMockFiles(): FileArtifact[] {
  const files: FileArtifact[] = [];
  let id = 1;

  const screenshots = [
    'Screenshot_2026-10-28_at_14.02.19.png',
    'CleanShot_2026-10-25_at_09.11.30.png',
    'Screen_Recording_2026-10-20_bug_repro.mov',
    'Screenshot_2026-10-18_at_23.44.02.png',
    'CleanShot_mockup_v2_hero_section.png',
    'Screenshot_color_palette_inspire.png',
    'Screenshot_error_stack_trace_vite.png',
    'Screenshot_2026-10-12_terminal_glitch.png',
    'CleanShot_receipt_capture_uber.png',
    'Screenshot_graph_chart_metrics.png',
  ];

  const pdfs = [
    'Q3_2026_Investor_Update_Final.pdf',
    'Consulting_Agreement_Executed_v3.pdf',
    'W2_Tax_Summary_Statement_2025.pdf',
    'AWS_Certified_Architect_Certificate.pdf',
    'Office_Lease_Agreement_Addendum.pdf',
    'Medical_Insurance_EOB_October.pdf',
    'System_Design_Whitepaper_v1.4.pdf',
    'Employee_Handboook_2026_Revised.pdf',
    'Flight_Itinerary_SanFrancisco_JFK.pdf',
    'Bank_Wire_Confirmation_Deposit.pdf',
  ];

  const installers = [
    'docker_desktop_mac_apple_silicon_v4.35.dmg',
    'postman_agent_darwin_arm64.dmg',
    'slack_desktop_mac_arm64_v4.40.pkg',
    'discord_setup_universal.dmg',
    'notion_mac_installer_x64.dmg',
    'visual_studio_code_darwin_arm64.zip',
    'wireshark_packet_analyzer_v4.2.dmg',
    'zoom_meeting_client_silicon.pkg',
  ];

  const archives = [
    'project_backup_october_2024.zip',
    'client_assets_raw_hires.tar.gz',
    'figma_icons_vector_export.zip',
    'logs_dump_production_incident.tar.gz',
    'database_migration_dump.sql.gz',
  ];

  const messyTemp = [
    'untitled_notes_3am.txt',
    'draft_email_to_investor.docx',
    'npm_debug_error_dump.log',
    'test_curl_response.json',
    'scratch_query_sql.sql',
    'temp_output_vector.ai',
    'dump_cache_001.tmp',
  ];

  // Generate 40 screenshots
  for (let i = 0; i < 40; i++) {
    const base = screenshots[i % screenshots.length];
    files.push({
      id: `file-ss-${id++}`,
      name: i > 9 ? `copy_${i}_${base}` : base,
      extension: base.split('.').pop() || 'png',
      sizeBytes: 1024 * (1200 + (i * 350) % 4500),
      createdDate: `2026-10-${Math.max(1, 31 - (i % 28)).toString().padStart(2, '0')}`,
      originalPath: `~/Downloads/${base}`,
      currentPath: `~/Downloads/${base}`,
      category: 'screenshot',
      status: 'in_downloads',
    });
  }

  // Generate 35 PDFs
  for (let i = 0; i < 35; i++) {
    const base = pdfs[i % pdfs.length];
    files.push({
      id: `file-pdf-${id++}`,
      name: i > 9 ? `${base.replace('.pdf', '')}_v${i}.pdf` : base,
      extension: 'pdf',
      sizeBytes: 1024 * (400 + (i * 720) % 8000),
      createdDate: `2026-10-${Math.max(1, 30 - (i % 25)).toString().padStart(2, '0')}`,
      originalPath: `~/Downloads/${base}`,
      currentPath: `~/Downloads/${base}`,
      category: 'pdf',
      status: 'in_downloads',
    });
  }

  // Generate 25 Installers
  for (let i = 0; i < 25; i++) {
    const base = installers[i % installers.length];
    files.push({
      id: `file-inst-${id++}`,
      name: i > 7 ? `installer_${i}_${base}` : base,
      extension: base.split('.').pop() || 'dmg',
      sizeBytes: 1024 * 1024 * (45 + (i * 30) % 250), // 45MB - 300MB
      createdDate: `2026-09-${Math.max(1, 30 - (i % 20)).toString().padStart(2, '0')}`,
      originalPath: `~/Downloads/${base}`,
      currentPath: `~/Downloads/${base}`,
      category: 'installer',
      status: 'in_downloads',
    });
  }

  // Generate 15 Archives
  for (let i = 0; i < 15; i++) {
    const base = archives[i % archives.length];
    files.push({
      id: `file-arc-${id++}`,
      name: base,
      extension: 'zip',
      sizeBytes: 1024 * 1024 * (80 + (i * 45) % 400),
      createdDate: `2026-08-15`,
      originalPath: `~/Downloads/${base}`,
      currentPath: `~/Downloads/${base}`,
      category: 'archive',
      status: 'in_downloads',
    });
  }

  // Generate 25 Messy Temp files
  for (let i = 0; i < 25; i++) {
    const base = messyTemp[i % messyTemp.length];
    files.push({
      id: `file-tmp-${id++}`,
      name: `${base.replace('.', `_${i}.`)}`,
      extension: base.split('.').pop() || 'tmp',
      sizeBytes: 1024 * (12 + (i * 45) % 180),
      createdDate: `2026-10-31`,
      originalPath: `~/Downloads/${base}`,
      currentPath: `~/Downloads/${base}`,
      category: 'messy_temp',
      status: 'in_downloads',
    });
  }

  // Inject Golden Kavacha Protected Files
  files.push(
    {
      id: `file-vip-1`,
      name: 'id_rsa_production_root.pem',
      extension: 'pem',
      sizeBytes: 4096,
      createdDate: '2026-10-01',
      originalPath: '~/Downloads/id_rsa_production_root.pem',
      currentPath: '~/Downloads/id_rsa_production_root.pem',
      category: 'messy_temp',
      status: 'in_downloads',
      isVip: true,
      vipReason: 'Critical Infrastructure SSH Key (Protected by Kavacha)',
      kavachaActive: true,
      artifactTypeLabel: 'स्वर्ण सुरक्षा कवच (Kavacha Vault)',
    },
    {
      id: `file-vip-2`,
      name: 'Executed_Company_Articles_Incorporation.pdf',
      extension: 'pdf',
      sizeBytes: 1024 * 3500,
      createdDate: '2026-09-15',
      originalPath: '~/Downloads/Executed_Company_Articles_Incorporation.pdf',
      currentPath: '~/Downloads/Executed_Company_Articles_Incorporation.pdf',
      category: 'pdf',
      status: 'in_downloads',
      isVip: true,
      vipReason: 'Corporate Legal Charter (Protected by Kavacha)',
      kavachaActive: true,
      artifactTypeLabel: 'स्वर्ण सुरक्षा कवच (Kavacha Vault)',
    }
  );

  return files;
}

export function generateMockExpenses(): ExpenseArtifact[] {
  const expenses: ExpenseArtifact[] = [];
  let id = 1;

  const businessMerchants = [
    { merchant: 'Amazon Web Services (AWS)', category: 'Cloud Infrastructure', avg: 428.50, ocr: 'AWS Cloud Services - Compute & S3 Storage. Tax ID: 91-029410' },
    { merchant: 'OpenAI Platform API', category: 'AI Software & API', avg: 145.20, ocr: 'OpenAI API Token Billing - GPT-4o usage. Ref: #OAI-99120' },
    { merchant: 'GitHub Enterprise Copilot', category: 'Software Subscriptions', avg: 42.00, ocr: 'GitHub Inc. Copilot Business licenses (2 seats). Ref: #GH-1284' },
    { merchant: 'Google Workspace', category: 'Office Software', avg: 72.00, ocr: 'Google LLC - 6 Business Starter Accounts. Ref: #GSUITE-881' },
    { merchant: 'Figma Organization', category: 'Design Tools', avg: 150.00, ocr: 'Figma Enterprise Subscription - Design System access' },
    { merchant: 'Vercel Inc Hosting', category: 'Cloud Infrastructure', avg: 20.00, ocr: 'Vercel Pro Team Plan - Serverless Edge Bandwidth' },
    { merchant: 'Linear Software Inc', category: 'Project Management', avg: 35.00, ocr: 'Linear Standard - Issue tracking and project planning' },
    { merchant: 'Delta Air Lines JFK->SFO', category: 'Travel & Transportation', avg: 540.20, ocr: 'Passenger Ticket & Baggage Check. Flight DL 492' },
    { merchant: 'Marriott Marquis Downtown', category: 'Lodging & Conferences', avg: 385.00, ocr: 'Guest Folio - Room 1402, Tech Summit 2026' },
    { merchant: 'WeWork Flexible Workspace', category: 'Rent & Office Space', avg: 450.00, ocr: 'Monthly Hot Desk Membership. Invoice #WE-88129' },
  ];

  const personalMerchants = [
    { merchant: 'DoorDash Midnight Wings', category: 'Personal Dining', avg: 48.90, ocr: 'Late night delivery order - Hot Wings & Sodas' },
    { merchant: 'Steam Games Store', category: 'Entertainment', avg: 59.99, ocr: 'Valve Corp - Purchase of Cyberpunk Phantom Liberty' },
    { merchant: 'Netflix 4K Premium', category: 'Personal Streaming', avg: 22.99, ocr: 'Monthly streaming plan subscription' },
    { merchant: 'PlayStation Network Store', category: 'Entertainment', avg: 79.99, ocr: 'Sony Interactive Entertainment digital purchase' },
    { merchant: 'Trader Joe\'s Grocery', category: 'Groceries', avg: 98.40, ocr: 'Organic apples, sourdough bread, sparkling water' },
    { merchant: 'Spotify Family Plan', category: 'Personal Streaming', avg: 19.99, ocr: 'Spotify Premium Family monthly subscription' },
  ];

  const disputedMerchants = [
    { merchant: 'UNKNOWN SAAS RECURRING IRL', category: 'Disputed / Suspicious', avg: 99.00, ocr: 'RECURRING BILLING DUBLIN IE - No company contact provided' },
    { merchant: 'Hotel Minibar Overcharge', category: 'Disputed / Split', avg: 85.00, ocr: 'Automated snack tray sensor trigger (Unconsumed items)' },
    { merchant: 'Duplicate Wire Transfer Fee', category: 'Bank Error', avg: 45.00, ocr: 'Overlapping international wire fee levied in duplicate' },
  ];

  // 60 Business Expenses
  for (let i = 0; i < 60; i++) {
    const item = businessMerchants[i % businessMerchants.length];
    const variance = (Math.sin(i * 1.5) * 0.25);
    const amount = Number((item.avg * (1 + variance)).toFixed(2));
    expenses.push({
      id: `exp-biz-${id++}`,
      merchant: item.merchant,
      amount,
      date: `2026-10-${Math.max(1, 31 - (i % 28)).toString().padStart(2, '0')}`,
      account: i % 2 === 0 ? 'Chase Ink Business (•••• 4912)' : 'Silicon Valley Bank (•••• 8821)',
      suggestedCategory: item.category,
      confidence: 0.92 - (i % 10) * 0.02,
      ocrSnippet: item.ocr,
      receiptMatched: true,
      status: 'pending_review',
    });
  }

  // 40 Personal Expenses
  for (let i = 0; i < 40; i++) {
    const item = personalMerchants[i % personalMerchants.length];
    const amount = Number((item.avg * (1 + (Math.sin(i * 2) * 0.15))).toFixed(2));
    expenses.push({
      id: `exp-per-${id++}`,
      merchant: item.merchant,
      amount,
      date: `2026-10-${Math.max(1, 30 - (i % 25)).toString().padStart(2, '0')}`,
      account: 'Amex Personal Gold (•••• 1009)',
      suggestedCategory: item.category,
      confidence: 0.88,
      ocrSnippet: item.ocr,
      receiptMatched: false,
      status: 'pending_review',
    });
  }

  // 20 Disputed Expenses
  for (let i = 0; i < 20; i++) {
    const item = disputedMerchants[i % disputedMerchants.length];
    expenses.push({
      id: `exp-disp-${id++}`,
      merchant: item.merchant,
      amount: item.avg,
      date: `2026-10-${Math.max(1, 28 - (i % 20)).toString().padStart(2, '0')}`,
      account: 'Chase Ink Business (•••• 4912)',
      suggestedCategory: item.category,
      confidence: 0.45,
      ocrSnippet: item.ocr,
      receiptMatched: false,
      status: 'pending_review',
    });
  }

  return expenses;
}

export function generateMockCodeIssues(): CodeIssueArtifact[] {
  const issues: CodeIssueArtifact[] = [];
  let id = 1;

  const filePaths = [
    'src/services/authService.ts',
    'src/components/dashboard/MetricsChart.tsx',
    'src/lib/api/paymentGateway.ts',
    'src/hooks/useRealtimeSync.ts',
    'src/workers/dataCruncher.worker.ts',
    'src/utils/stringSanitizer.ts',
    'src/store/userProfileSlice.ts',
    'src/engine/physicsRenderer.ts',
  ];

  // 25 Missing Semicolons
  for (let i = 0; i < 25; i++) {
    const filePath = filePaths[i % filePaths.length];
    const line = 14 + (i * 7);
    issues.push({
      id: `code-semi-${id++}`,
      filePath,
      line,
      column: 32,
      issueType: 'missing-semicolon',
      rawSnippet: `const sessionToken = await fetchAuthToken()`,
      fixedSnippet: `const sessionToken = await fetchAuthToken();`,
      description: `Missing semicolon [semi] at line ${line} in ${filePath}`,
      status: 'unfixed',
    });
  }

  // 25 Unused Imports
  for (let i = 0; i < 25; i++) {
    const filePath = filePaths[(i + 2) % filePaths.length];
    const line = 2 + (i % 6);
    issues.push({
      id: `code-import-${id++}`,
      filePath,
      line,
      column: 10,
      issueType: 'unused-import',
      rawSnippet: `import { useMemo, useCallback, unusedDeadHelper_${i} } from 'react';`,
      fixedSnippet: `import { useMemo, useCallback } from 'react';`,
      description: `Dead code: 'unusedDeadHelper_${i}' is declared but never read [@typescript-eslint/no-unused-vars]`,
      status: 'unfixed',
    });
  }

  // 25 Console.logs
  for (let i = 0; i < 25; i++) {
    const filePath = filePaths[(i + 4) % filePaths.length];
    const line = 35 + (i * 5);
    issues.push({
      id: `code-log-${id++}`,
      filePath,
      line,
      column: 3,
      issueType: 'console-log',
      rawSnippet: `console.log("DEBUG: token is", authToken, "timestamp:", Date.now());`,
      fixedSnippet: `// [Stripped debugging console.log]`,
      description: `Unexpected console statement [no-console] in production bundle at line ${line}`,
      status: 'unfixed',
    });
  }

  // 15 Var to Const
  for (let i = 0; i < 15; i++) {
    const filePath = filePaths[(i + 6) % filePaths.length];
    const line = 60 + (i * 4);
    issues.push({
      id: `code-var-${id++}`,
      filePath,
      line,
      column: 5,
      issueType: 'var-to-const',
      rawSnippet: `var retryAttempts = 3;`,
      fixedSnippet: `const retryAttempts = 3;`,
      description: `Unexpected 'var', use 'let' or 'const' instead [no-var]`,
      status: 'unfixed',
    });
  }

  return issues;
}
