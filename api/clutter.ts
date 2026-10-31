export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const simulatedFiles = [
    { id: 'f1', name: 'CleanShot_2026-10-25_at_09.11.30.png', category: 'screenshot', formattedSize: '2.8 MB', sizeBytes: 2840000, ageDays: 6, suggestedAction: 'archive' },
    { id: 'f2', name: 'Screenshot_terminal_glitch_err.png', category: 'screenshot', formattedSize: '1.4 MB', sizeBytes: 1420000, ageDays: 3, suggestedAction: 'archive' },
    { id: 'f3', name: 'CleanShot_mockup_v2_hero.png', category: 'screenshot', formattedSize: '3.1 MB', sizeBytes: 3100000, ageDays: 12, suggestedAction: 'archive' },
    { id: 'f4', name: 'Screenshot_2026-10-18_at_23.44.02.png', category: 'screenshot', formattedSize: '1.9 MB', sizeBytes: 1890000, ageDays: 13, suggestedAction: 'archive' },
    { id: 'f5', name: 'docker_desktop_mac_apple_silicon_v4.35.dmg', category: 'installer', formattedSize: '786 MB', sizeBytes: 786000000, ageDays: 45, suggestedAction: 'trash' },
    { id: 'f6', name: 'postman_agent_darwin_arm64.dmg', category: 'installer', formattedSize: '145 MB', sizeBytes: 145000000, ageDays: 38, suggestedAction: 'trash' },
    { id: 'f7', name: 'slack_desktop_mac_arm64_v4.40.pkg', category: 'installer', formattedSize: '210 MB', sizeBytes: 210000000, ageDays: 24, suggestedAction: 'trash' },
    { id: 'f8', name: 'client_assets_raw_hires.tar.gz', category: 'archive', formattedSize: '450 MB', sizeBytes: 450000000, ageDays: 60, suggestedAction: 'compress' },
    { id: 'f9', name: 'project_backup_october_2024.zip', category: 'archive', formattedSize: '120 MB', sizeBytes: 120000000, ageDays: 92, suggestedAction: 'compress' },
    { id: 'f10', name: 'legacy_tax_computation_scratch_v1.xlsx', category: 'stale_document', formattedSize: '4.8 MB', sizeBytes: 4800000, ageDays: 140, suggestedAction: 'trash' },
  ];

  const totalBytes = simulatedFiles.reduce((acc, curr) => acc + curr.sizeBytes, 0);

  res.status(200).json({
    timestamp: Date.now(),
    scanLocation: 'Cloud Sandbox / Edge Clutter Telemetry',
    items: simulatedFiles,
    totalBytes,
    formattedTotalBytes: `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`,
    entropyScore: 78,
    summary: {
      screenshotsCount: 4,
      installersCount: 3,
      archivesCount: 2,
      staleDocsCount: 1,
    },
  });
}
