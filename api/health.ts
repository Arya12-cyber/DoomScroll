export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  res.status(200).json({
    status: 'healthy',
    service: 'Karmayogi: The Klesha Slayer (Vercel Serverless)',
    version: '1.0.0',
    mantra: 'योगः कर्मसु कौशलम् (Excellence in Action is Yoga)',
    timestamp: Date.now(),
    deployment: 'Vercel Edge / Serverless',
  });
}
