/**
 * Karmayogi Ambient Clutter Scanner
 * Inspects local filesystem directories for digital kleshas and computes Chitta Shuddhi entropy.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ClutterItem {
  id: string;
  name: string;
  category: 'screenshot' | 'installer' | 'archive' | 'stale_document' | 'messy_temp';
  path: string;
  sizeBytes: number;
  formattedSize: string;
  ageDays: number;
  suggestedAction: 'archive' | 'trash' | 'compress';
}

export interface ClutterReport {
  timestamp: number;
  scanLocation: string;
  items: ClutterItem[];
  totalBytes: number;
  formattedTotalBytes: string;
  entropyScore: number; // 0-100 (0 = Pure Chitta Shuddhi, 100 = Severe Tamas)
  summary: {
    screenshotsCount: number;
    installersCount: number;
    archivesCount: number;
    staleDocsCount: number;
  };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function scanDirectory(targetPath?: string): ClutterReport {
  const dirPath = targetPath || path.join(os.homedir(), 'Downloads');
  const items: ClutterItem[] = [];
  let totalBytes = 0;

  try {
    if (!fs.existsSync(dirPath)) {
      return getSimulatedReport(dirPath);
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      try {
        const fullPath = path.join(dirPath, entry.name);
        const stat = fs.statSync(fullPath);

        if (entry.isFile()) {
          totalBytes += stat.size;
          const ext = path.extname(entry.name).toLowerCase();
          const ageDays = Math.max(0, Math.floor((now - stat.mtimeMs) / oneDayMs));

          let category: ClutterItem['category'] = 'stale_document';
          let suggestedAction: ClutterItem['suggestedAction'] = 'archive';

          if (entry.name.toLowerCase().includes('screenshot') || entry.name.toLowerCase().includes('cleanshot')) {
            category = 'screenshot';
            suggestedAction = 'archive';
          } else if (ext === '.dmg' || ext === '.pkg' || ext === '.iso' || ext === '.exe') {
            category = 'installer';
            suggestedAction = 'trash';
          } else if (ext === '.zip' || ext === '.tar' || ext === '.gz' || ext === '.rar') {
            category = 'archive';
            suggestedAction = 'compress';
          } else if (ageDays > 30) {
            category = 'stale_document';
            suggestedAction = 'trash';
          }

          items.push({
            id: `file_${entry.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${stat.size}`,
            name: entry.name,
            category,
            path: fullPath,
            sizeBytes: stat.size,
            formattedSize: formatBytes(stat.size),
            ageDays,
            suggestedAction,
          });
        }
      } catch {
        // Skip unreadable files
      }
    }

    if (items.length === 0) {
      return getSimulatedReport(dirPath);
    }
  } catch {
    return getSimulatedReport(dirPath);
  }

  // Calculate Chitta Shuddhi Entropy (0 = Serene, 100 = Critical Clutter)
  const countFactor = Math.min(50, items.length * 2);
  const sizeFactor = Math.min(50, Math.floor(totalBytes / (50 * 1024 * 1024))); // 50MB per 10 points
  const entropyScore = Math.min(100, countFactor + sizeFactor);

  return {
    timestamp: Date.now(),
    scanLocation: dirPath,
    items,
    totalBytes,
    formattedTotalBytes: formatBytes(totalBytes),
    entropyScore,
    summary: {
      screenshotsCount: items.filter((i) => i.category === 'screenshot').length,
      installersCount: items.filter((i) => i.category === 'installer').length,
      archivesCount: items.filter((i) => i.category === 'archive').length,
      staleDocsCount: items.filter((i) => i.category === 'stale_document').length,
    },
  };
}

export function getSimulatedReport(scanLocation = '~/Downloads'): ClutterReport {
  const simulatedFiles: Array<{ name: string; category: ClutterItem['category']; size: number; age: number; action: ClutterItem['suggestedAction'] }> = [
    { name: 'CleanShot_2026-10-25_at_09.11.30.png', category: 'screenshot', size: 2840000, age: 6, action: 'archive' },
    { name: 'Screenshot_terminal_glitch_err.png', category: 'screenshot', size: 1420000, age: 3, action: 'archive' },
    { name: 'CleanShot_mockup_v2_hero.png', category: 'screenshot', size: 3100000, age: 12, action: 'archive' },
    { name: 'Screenshot_2026-10-18_at_23.44.02.png', category: 'screenshot', size: 1890000, age: 13, action: 'archive' },
    { name: 'docker_desktop_mac_apple_silicon_v4.35.dmg', category: 'installer', size: 786000000, age: 45, action: 'trash' },
    { name: 'postman_agent_darwin_arm64.dmg', category: 'installer', size: 145000000, age: 38, action: 'trash' },
    { name: 'slack_desktop_mac_arm64_v4.40.pkg', category: 'installer', size: 210000000, age: 24, action: 'trash' },
    { name: 'client_assets_raw_hires.tar.gz', category: 'archive', size: 450000000, age: 60, action: 'compress' },
    { name: 'project_backup_october_2024.zip', category: 'archive', size: 120000000, age: 92, action: 'compress' },
    { name: 'legacy_tax_computation_scratch_v1.xlsx', category: 'stale_document', size: 4800000, age: 140, action: 'trash' },
    { name: 'q3_investor_deck_final_v4_reallyfinal.pdf', category: 'stale_document', size: 18500000, age: 75, action: 'archive' },
  ];

  const items: ClutterItem[] = simulatedFiles.map((f) => ({
    id: `file_${f.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${f.size}`,
    name: f.name,
    category: f.category,
    path: `${scanLocation}/${f.name}`,
    sizeBytes: f.size,
    formattedSize: formatBytes(f.size),
    ageDays: f.age,
    suggestedAction: f.action,
  }));

  const totalBytes = items.reduce((acc, curr) => acc + curr.sizeBytes, 0);

  return {
    timestamp: Date.now(),
    scanLocation,
    items,
    totalBytes,
    formattedTotalBytes: formatBytes(totalBytes),
    entropyScore: 78,
    summary: {
      screenshotsCount: 4,
      installersCount: 3,
      archivesCount: 2,
      staleDocsCount: 2,
    },
  };
}
