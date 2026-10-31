export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  res.status(200).json({
    agent: 'सारथि (Sarathi Autonomous Nishkama AI)',
    status: 'active',
    mode: 'escalation_guarded',
    accuracy: 99.4,
    sankalpaPledge: 'Zero non-consensual destructive action. All high-entropy mutations require human affirmation.',
    supportedModules: [
      'agni-pariksha (Spam & Newsletter Vaporization)',
      'mandara-sifter (Downloads & Desktop Physics Sorter)',
      'chitragupta-ledger (Expense Rhythmic Dharma Sorter)',
      'vritra-vyuha (Code Smell & AST Dungeon Slasher)',
    ],
  });
}
