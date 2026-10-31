import React, { useRef, useEffect, useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { vedicSound } from '../../lib/audio/VedicSoundEngine';
import { CodeIssueArtifact } from '../../types';
import {
  ArrowLeft,
  Eye,
  Zap,
  Sword,
  Shield,
  Bug,
  Check,
  Terminal,
  Sparkles,
  Flame,
  GitCommit,
} from 'lucide-react';

interface BugEnemy {
  id: string;
  issue: CodeIssueArtifact;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  type: 'semicolon' | 'unused-import' | 'console-log' | 'var-to-const';
  name: string;
  color: string;
  glowColor: string;
  lungeTimer: number;
  wingPhase: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'chakra' | 'boss-bullet';
  color: string;
  life: number;
  maxLife: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  glyph?: string;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

interface BossVritra {
  active: boolean;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  angle: number;
  heads: { x: number; y: number; angle: number; hp: number }[];
}

export const VritraVyuha: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    codeIssues,
    fixCodeIssue,
    addScore,
    incrementCombo,
    stats,
    toggleRealityLens,
    isScreenShakeEnabled,
    isSarathiAutopilotEnabled,
    sarathiSpeed,
    triggerEscalation,
    activeEscalation,
  } = useTransactionStore();

  const [recentFixedIssue, setRecentFixedIssue] = useState<CodeIssueArtifact | null>(null);
  const [slashesCount, setSlashesCount] = useState(0);
  const [ultimateCharge, setUltimateCharge] = useState(0);
  const [dashCooldown, setDashCooldown] = useState(0);
  const [gitCommits, setGitCommits] = useState<
    { hash: string; msg: string; time: string; issueType: string }[]
  >([]);

  // Action refs for UI buttons
  const triggerSlashRef = useRef<() => void>(() => {});
  const triggerDashRef = useRef<() => void>(() => {});
  const triggerChakraRef = useRef<() => void>(() => {});
  const triggerCleanseRef = useRef<() => void>(() => {});

  const stateRef = useRef({
    hero: {
      x: 400,
      y: 400,
      vx: 0,
      vy: 0,
      radius: 24,
      angle: 0,
      speed: 6.4,
      isSlashing: false,
      slashTime: 0,
      slashRadius: 74,
      comboStep: 0,
      isDashing: false,
      dashTime: 0,
      dashVx: 0,
      dashVy: 0,
      ghostTrails: [] as { x: number; y: number; angle: number; alpha: number }[],
    },
    keys: {} as Record<string, boolean>,
    mouse: { x: 400, y: 400, isDown: false, isRightDown: false },
    bugs: [] as BugEnemy[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    boss: {
      active: false,
      x: 400,
      y: 160,
      hp: 600,
      maxHp: 600,
      radius: 56,
      angle: 0,
      heads: [
        { x: -35, y: -25, angle: 0, hp: 150 },
        { x: 0, y: -45, angle: 0, hp: 150 },
        { x: 35, y: -25, angle: 0, hp: 150 },
      ],
    } as BossVritra,
    cleanseNova: {
      active: false,
      radius: 0,
      maxRadius: 1000,
    },
    lastSpawnTime: 0,
    screenShake: 0,
    ultimateCharge: 0,
  });

  useEffect(() => {
    stateRef.current.ultimateCharge = ultimateCharge;
  }, [ultimateCharge]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    vedicSound.init();

    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        stateRef.current.hero.x = canvas.width / 2;
        stateRef.current.hero.y = canvas.height / 2;
        stateRef.current.boss.x = canvas.width / 2;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial spawn of bug demons
    const unfixedIssues = codeIssues.filter((c) => c.status === 'unfixed');
    const initialBugs = unfixedIssues.slice(0, 15);

    const typeMetaMap: Record<string, any> = {
      'missing-semicolon': { type: 'semicolon', name: '; वृश्चिक (Scorpion)', color: '#dc2626', glow: 'rgba(220, 38, 38, 0.65)' },
      'unused-import': { type: 'unused-import', name: 'कीट (Import Wasp)', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.65)' },
      'console-log': { type: 'console-log', name: 'पिशाच (Console Goblin)', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.65)' },
      'var-to-const': { type: 'var-to-const', name: 'सर्प (Var Slug)', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.65)' },
    };

    stateRef.current.bugs = initialBugs.map((issue, idx) => {
      const angle = (idx / initialBugs.length) * Math.PI * 2;
      const dist = 190 + Math.random() * 140;
      const meta = typeMetaMap[issue.issueType] || typeMetaMap['missing-semicolon'];

      return {
        id: issue.id,
        issue,
        x: canvas.width / 2 + Math.cos(angle) * dist,
        y: canvas.height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: meta.type === 'console-log' ? 24 : 19,
        hp: meta.type === 'console-log' ? 2 : 1,
        maxHp: meta.type === 'console-log' ? 2 : 1,
        type: meta.type,
        name: meta.name,
        color: meta.color,
        glowColor: meta.glow,
        lungeTimer: Math.random() * 60,
        wingPhase: Math.random() * Math.PI * 2,
      };
    });

    const addParticles = (x: number, y: number, color: string, count = 16, glyph?: string) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 5.5;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 3,
          color,
          alpha: 1,
          life: 0,
          maxLife: 24 + Math.random() * 12,
          glyph: glyph && Math.random() > 0.4 ? glyph : undefined,
        });
      }
    };

    const addFloatingText = (x: number, y: number, text: string, color: string) => {
      stateRef.current.floatingTexts.push({
        id: Math.random().toString(),
        x,
        y,
        text,
        color,
        alpha: 1,
        vy: -1.5,
      });
    };

    // Khanda Sword Slash Combo
    const triggerSlash = () => {
      const hero = stateRef.current.hero;
      hero.isSlashing = true;
      hero.slashTime = performance.now();
      hero.comboStep = (hero.comboStep + 1) % 3;
      vedicSound.playAstraSlash();

      const bugs = stateRef.current.bugs;
      const boss = stateRef.current.boss;

      for (let i = bugs.length - 1; i >= 0; i--) {
        const bug = bugs[i];
        const dx = bug.x - hero.x;
        const dy = bug.y - hero.y;
        const dist = Math.hypot(dx, dy);

        if (dist < hero.slashRadius + bug.radius) {
          const angleToBug = Math.atan2(dy, dx);
          let angleDiff = Math.abs(angleToBug - hero.angle);
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          angleDiff = Math.abs(angleDiff);

          if (angleDiff < Math.PI * 0.75 || dist < hero.radius + 20) {
            bug.hp -= 1;
            addParticles(bug.x, bug.y, bug.color, 12);
            vedicSound.playMridangam('chaapu');

            if (bug.hp <= 0) {
              bugs.splice(i, 1);
              addParticles(bug.x, bug.y, bug.color, 28, bug.type === 'semicolon' ? ';' : '{}');
              stateRef.current.screenShake = 9;

              // Physical Chore Execution
              fixCodeIssue(bug.id);
              setRecentFixedIssue(bug.issue);
              setSlashesCount((prev) => prev + 1);

              // Royal Git Commit Edict
              const randHash = Math.random().toString(16).slice(2, 9);
              setGitCommits((prev) => [
                {
                  hash: randHash,
                  msg: `${bug.issue.issueType}: ${bug.issue.description.slice(0, 42)}`,
                  time: new Date().toLocaleTimeString(),
                  issueType: bug.issue.issueType,
                },
                ...prev.slice(0, 15),
              ]);

              setUltimateCharge((prev) => Math.min(100, prev + 12));
              addFloatingText(bug.x, bug.y - 18, `संहृतम्: ${bug.name}`, bug.color);
              addScore(280);
              incrementCombo();

              // Boss Vritra summons when 5 bugs remain
              if (bugs.length === 5 && !boss.active) {
                boss.active = true;
                boss.hp = boss.maxHp;
                vedicSound.playShankhaBlast();
                addFloatingText(canvas.width / 2, 120, '⚠️ वृत्रासुर आगमन! (Vritra Glitch Hydra Awakened)', '#dc2626');
              }
            }
          }
        }
      }

      // Hits on Vritra Boss
      if (boss.active) {
        const bdx = boss.x - hero.x;
        const bdy = boss.y - hero.y;
        const bdist = Math.hypot(bdx, bdy);

        if (bdist < hero.slashRadius + boss.radius) {
          boss.hp -= 35;
          addParticles(hero.x + (bdx / bdist) * 40, hero.y + (bdy / bdist) * 40, '#dc2626', 18);
          vedicSound.playMridangam('bass');
          stateRef.current.screenShake = 12;

          if (boss.hp <= 0) {
            boss.active = false;
            vedicSound.playBansuriFanfare();
            vedicSound.playTempleBell(0.8, 4.0);
            stateRef.current.screenShake = 22;
            addParticles(boss.x, boss.y, '#22c55e', 60);
            addFloatingText(boss.x, boss.y, '🏆 वृत्रासुर वध सम्पूर्णम्! (ALL LINT ERRORS PURGED)', '#22c55e');
            addScore(4000);
          }
        }
      }
    };

    // Dodge Dash
    const triggerDash = () => {
      const hero = stateRef.current.hero;
      if (hero.isDashing) return;

      const keys = stateRef.current.keys;
      let dx = 0;
      let dy = 0;
      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      if (dx === 0 && dy === 0) {
        dx = Math.cos(hero.angle);
        dy = Math.sin(hero.angle);
      } else {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
      }

      hero.isDashing = true;
      hero.dashTime = performance.now();
      hero.dashVx = dx * 16;
      hero.dashVy = dy * 16;
      vedicSound.playMridangam('ta');

      setDashCooldown(100);
      setTimeout(() => setDashCooldown(0), 450);
    };

    // Spinning Sudarshana Chakra Shurikens
    const triggerChakra = () => {
      const hero = stateRef.current.hero;
      vedicSound.playAgneyastraArrow();

      [-0.18, 0, 0.18].forEach((offsetAngle) => {
        const fireAngle = hero.angle + offsetAngle;
        const speed = 14;
        stateRef.current.projectiles.push({
          x: hero.x + Math.cos(fireAngle) * 20,
          y: hero.y + Math.sin(fireAngle) * 20,
          vx: Math.cos(fireAngle) * speed,
          vy: Math.sin(fireAngle) * speed,
          radius: 7,
          type: 'chakra',
          color: '#fbbf24',
          life: 0,
          maxLife: 45,
        });
      });

      addParticles(hero.x, hero.y, '#fbbf24', 8);
    };

    // Ultimate Gayatri Cleanse Nova
    const triggerUltimateCleanse = () => {
      if (stateRef.current.ultimateCharge < 100) return;

      vedicSound.playBrahmastraPurge();
      vedicSound.playBansuriFanfare();
      stateRef.current.cleanseNova.active = true;
      stateRef.current.cleanseNova.radius = 10;
      stateRef.current.screenShake = 20;
      setUltimateCharge(0);

      const bugs = stateRef.current.bugs;
      bugs.forEach((bug) => {
        fixCodeIssue(bug.id);
        addParticles(bug.x, bug.y, '#22c55e', 20, ';');
      });
      stateRef.current.bugs = [];

      addFloatingText(canvas.width / 2, canvas.height / 2, '⚡ गायत्री महामंत्र शुद्धि: REPO FORMATTED!', '#22c55e');
      addScore(2500);
    };

    // Store callbacks for UI buttons
    triggerSlashRef.current = triggerSlash;
    triggerDashRef.current = triggerDash;
    triggerChakraRef.current = triggerChakra;
    triggerCleanseRef.current = triggerUltimateCleanse;

    // Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
        triggerSlash();
      } else if (e.key === 'Shift') {
        triggerDash();
      } else if (e.key === 'q' || e.key === 'Q' || e.key === 'e' || e.key === 'E') {
        triggerChakra();
      } else if (e.key === 'r' || e.key === 'R') {
        triggerUltimateCleanse();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - rect.left;
      stateRef.current.mouse.y = e.clientY - rect.top;

      const dx = stateRef.current.mouse.x - stateRef.current.hero.x;
      const dy = stateRef.current.mouse.y - stateRef.current.hero.y;
      stateRef.current.hero.angle = Math.atan2(dy, dx);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) triggerSlash();
      else if (e.button === 2) {
        e.preventDefault();
        triggerDash();
      } else if (e.button === 1) {
        e.preventDefault();
        triggerChakra();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const ty = e.touches[0].clientY - rect.top;
      stateRef.current.mouse.x = tx;
      stateRef.current.mouse.y = ty;
      const dx = tx - stateRef.current.hero.x;
      const dy = ty - stateRef.current.hero.y;
      stateRef.current.hero.angle = Math.atan2(dy, dx);
      triggerSlash();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const ty = e.touches[0].clientY - rect.top;
      stateRef.current.mouse.x = tx;
      stateRef.current.mouse.y = ty;
      const dx = tx - stateRef.current.hero.x;
      const dy = ty - stateRef.current.hero.y;
      stateRef.current.hero.angle = Math.atan2(dy, dx);
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('contextmenu', handleContextMenu);

    // ==========================================
    // 60 FPS ROGUE-LITE GAME LOOP
    // ==========================================
    let animationId: number;

    const loop = (currentTime: number) => {
      const state = stateRef.current;
      const {
        hero,
        keys,
        bugs,
        projectiles,
        particles,
        floatingTexts,
        boss,
        cleanseNova,
      } = state;

      // 1. Hero Movement & Dash Physics
      if (hero.isDashing) {
        hero.x += hero.dashVx;
        hero.y += hero.dashVy;
        hero.ghostTrails.push({ x: hero.x, y: hero.y, angle: hero.angle, alpha: 0.6 });
        if (currentTime - hero.dashTime > 160) {
          hero.isDashing = false;
        }
      } else if (isSarathiAutopilotEnabled && bugs.length > 0 && !activeEscalation) {
        // Sarathi Autonomous AI Steers Hero to Nearest Bug
        const target = bugs[0];
        const dx = target.x - hero.x;
        const dy = target.y - hero.y;
        const dist = Math.hypot(dx, dy);

        hero.angle = Math.atan2(dy, dx);
        const speed = hero.speed * (sarathiSpeed * 0.85);
        hero.vx += ((dx / (dist || 1)) * speed - hero.vx) * 0.22;
        hero.vy += ((dy / (dist || 1)) * speed - hero.vy) * 0.22;
        hero.x += hero.vx;
        hero.y += hero.vy;

        // Auto-slash or cast Chakra
        if (dist < 80 && currentTime - hero.slashTime > Math.max(120, 260 / sarathiSpeed)) {
          triggerSlash();
        } else if (dist > 150 && Math.random() < 0.05 * sarathiSpeed) {
          triggerChakra();
        }

        // Escalation check for exported public symbols / unused imports
        if (
          target.issue.issueType === 'unused-import' &&
          target.issue.filePath.includes('index') &&
          !activeEscalation &&
          Math.random() < 0.003
        ) {
          triggerEscalation({
            id: `esc-code-${target.id}`,
            title: 'सार्वजनिक संपुट आयात // Public API Export Pruning',
            description: `Import in ${target.issue.filePath}:${target.issue.line}: "${target.issue.rawSnippet}".`,
            riskLevel: 'medium',
            aiConfidence: 0.74,
            reason: 'Module lies in an index barrel file. Stripping this import might break external consumer packages.',
            targetArtifact: target.issue,
            moduleId: 'vritra-vyuha',
            suggestedActionLabel: 'Prune Unused AST Import',
            options: [
              {
                id: 'opt-fix',
                label: 'शुद्धी (Apply AST Dead-Code Strip)',
                description: 'Safely tree-shake import from bundle.',
                isRecommended: true,
                actionType: 'approve',
              },
              {
                id: 'opt-ignore',
                label: 'रक्षण (Preserve in Barrel Export)',
                description: 'Leave untouched for backward compatibility.',
                actionType: 'reject',
              },
            ],
          });
        }
      } else {
        let mx = 0;
        let my = 0;
        if (keys['w'] || keys['arrowup']) my -= 1;
        if (keys['s'] || keys['arrowdown']) my += 1;
        if (keys['a'] || keys['arrowleft']) mx -= 1;
        if (keys['d'] || keys['arrowright']) mx += 1;

        if (mx !== 0 && my !== 0) {
          mx *= 0.7071;
          my *= 0.7071;
        }

        const targetVx = mx * hero.speed;
        const targetVy = my * hero.speed;
        hero.vx += (targetVx - hero.vx) * 0.22;
        hero.vy += (targetVy - hero.vy) * 0.22;
        hero.x += hero.vx;
        hero.y += hero.vy;
      }

      hero.x = Math.max(hero.radius + 15, Math.min(canvas.width - hero.radius - 15, hero.x));
      hero.y = Math.max(hero.radius + 15, Math.min(canvas.height - hero.radius - 15, hero.y));

      if (hero.isSlashing && currentTime - hero.slashTime > 150) {
        hero.isSlashing = false;
      }

      // Update Dash Ghosts
      for (let i = hero.ghostTrails.length - 1; i >= 0; i--) {
        hero.ghostTrails[i].alpha -= 0.05;
        if (hero.ghostTrails[i].alpha <= 0) hero.ghostTrails.splice(i, 1);
      }

      // 2. Update Cleanse Nova
      if (cleanseNova.active) {
        cleanseNova.radius += 30;
        if (cleanseNova.radius > cleanseNova.maxRadius) {
          cleanseNova.active = false;
        }
      }

      // 3. Update Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        // Check Projectile vs Bug
        for (let j = bugs.length - 1; j >= 0; j--) {
          const bug = bugs[j];
          const dist = Math.hypot(p.x - bug.x, p.y - bug.y);

          if (dist < p.radius + bug.radius) {
            bug.hp -= 1;
            addParticles(p.x, p.y, p.color, 8);
            vedicSound.playMridangam('chaapu');

            if (bug.hp <= 0) {
              bugs.splice(j, 1);
              fixCodeIssue(bug.id);
              setRecentFixedIssue(bug.issue);
              addScore(280);
              incrementCombo();
              addFloatingText(bug.x, bug.y - 15, `चक्र प्रहार!`, '#fbbf24');
            }
            break;
          }
        }

        if (p.life >= p.maxLife) projectiles.splice(i, 1);
      }

      // 4. Update Bug AI
      bugs.forEach((bug) => {
        const dx = hero.x - bug.x;
        const dy = hero.y - bug.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 80) {
          bug.vx += (dx / dist) * 0.12;
          bug.vy += (dy / dist) * 0.12;
        }

        bug.vx *= 0.95;
        bug.vy *= 0.95;
        bug.x += bug.vx;
        bug.y += bug.vy;
      });

      // 5. Update Particles & Floating Text
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.018;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // ==========================================
      // 6. RENDER CANVAS SCENE
      // ==========================================
      ctx.save();

      if (state.screenShake > 0 && isScreenShakeEnabled) {
        ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
        state.screenShake = Math.max(0, state.screenShake - 0.5);
      }

      // Temple Dungeon Stone Grid
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#121727';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Gayatri Cleanse Nova Expansion
      if (cleanseNova.active) {
        ctx.save();
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 35;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, cleanseNova.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render Sudarshana Chakra Projectiles
      projectiles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color;
        ctx.rotate(currentTime * 0.03);

        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2;
          ctx.lineTo(Math.cos(a) * p.radius, Math.sin(a) * p.radius);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Render Bug Enemies
      bugs.forEach((bug) => {
        ctx.save();
        ctx.translate(bug.x, bug.y);
        ctx.shadowColor = bug.glowColor;
        ctx.shadowBlur = 12;

        ctx.fillStyle = bug.color;
        ctx.beginPath();
        ctx.arc(0, 0, bug.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.font = 'bold 9px "Noto Serif Devanagari", serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bug.type === 'semicolon' ? ';' : '{}', 0, 0);

        ctx.font = '10px "Noto Serif Devanagari", serif';
        ctx.fillStyle = '#ede5d5';
        ctx.fillText(bug.name, 0, bug.radius + 14);

        ctx.restore();
      });

      // Render Boss Vritra
      if (boss.active) {
        ctx.save();
        ctx.translate(boss.x, boss.y);
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 30;

        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px "Yatra One", serif';
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'center';
        ctx.fillText(`वृत्रासुर महादैत्य (${boss.hp} HP)`, 0, -boss.radius - 12);

        ctx.restore();
      }

      // Render Hero Ghost Trails
      hero.ghostTrails.forEach((gt) => {
        ctx.save();
        ctx.translate(gt.x, gt.y);
        ctx.rotate(gt.angle);
        ctx.fillStyle = `rgba(217, 119, 6, ${gt.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(0, 0, hero.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Hero with Golden Khanda Blade
      ctx.save();
      ctx.translate(hero.x, hero.y);
      ctx.rotate(hero.angle);
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 18;

      // Hero Body (Karmic Warrior)
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, hero.radius, 0, Math.PI * 2);
      ctx.fill();

      // Golden Khanda Blade
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(hero.radius * 0.5, -3, 24, 6);

      // Slash Arc
      if (hero.isSlashing) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, hero.slashRadius, -Math.PI * 0.6, Math.PI * 0.6);
        ctx.stroke();
      }

      ctx.restore();

      // Render Particles
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Render Floating Texts
      floatingTexts.forEach((ft) => {
        ctx.font = 'bold 12px "Noto Serif Devanagari", serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [codeIssues, isScreenShakeEnabled]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0a0d16] overflow-hidden select-none font-sans text-[#ede5d5]">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair touch-none" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 text-xs font-devanagari">
        <div className="flex items-center gap-3 bg-[#131622]/90 border border-vedic-gold/50 backdrop-blur-md px-4 py-2 rounded-2xl shadow-vedic-gold">
          <button
            onClick={onBackToHub}
            className="pointer-events-auto p-1 hover:bg-vedic-gold/20 text-vedic-gold-bright rounded-xl transition-colors"
            title="Return to Mandapa Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-vedic-gold tracking-widest font-bold">
              अध्याय ४ // वृत्र व्यूह (LINT ROGUE-LITE)
            </div>
            <div className="text-sm font-extrabold text-white">
              पुण्य: {stats.karmaPoints.toLocaleString()}
            </div>
          </div>
          <div className="h-6 w-px bg-vedic-gold/30" />
          <div>
            <div className="text-[10px] text-[#cbbda3]">असुर संहार</div>
            <div className="text-sm font-bold text-emerald-400">{stats.codeSmellsPurged} Bugs</div>
          </div>
        </div>

        {/* Center: Tapasya Combo & Gayatri Nova Gauge */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {stats.combo > 1 && (
            <div className="bg-gradient-to-r from-terracotta-deep to-vedic-gold border border-vedic-gold px-4 py-1.5 rounded-full text-white font-bold animate-pulse shadow-vedic-gold flex items-center gap-2">
              <Zap className="w-4 h-4 text-vedic-gold-bright fill-vedic-gold-bright" />
              <span>खड्ग प्रहार x{stats.combo}</span>
            </div>
          )}

          {/* Gayatri Cleanse Nova */}
          <button
            onClick={() => triggerCleanseRef.current?.()}
            disabled={ultimateCharge < 100}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all shadow-md ${
              ultimateCharge >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 border-white shadow-[0_0_25px_rgba(34,197,94,0.8)] animate-bounce cursor-pointer'
                : 'bg-slate-900/80 text-slate-400 border-slate-700'
            }`}
            title="Press [R] for Gayatri Cleanse Nova"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>गायत्री महामंत्र: {ultimateCharge}% [R]</span>
          </button>
        </div>

        {/* Right: Reality View */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-terracotta-deep to-[#7c2d12] hover:from-[#9a3412] hover:to-terracotta-deep border border-vedic-gold/60 text-vedic-gold-bright rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs"
          >
            <Eye className="w-3.5 h-3.5 text-vedic-gold-bright" />
            <span>प्रत्यक्ष संहिता [Tab]</span>
          </button>
        </div>
      </div>

      {/* TACTILE ON-SCREEN COMBAT ACTION BAR */}
      <div className="absolute bottom-[170px] left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-[#121522]/95 border border-vedic-gold/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl z-20 font-devanagari text-xs shadow-2xl pointer-events-auto">
        <button
          onClick={() => triggerSlashRef.current?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-vedic-gold/20 hover:bg-vedic-gold/30 border border-vedic-gold text-vedic-gold-bright font-black rounded-xl transition-all active:scale-95 shadow-vedic-gold"
          title="Khanda Combo Strike [Space / Click]"
        >
          <Sword className="w-4 h-4 fill-current" />
          <span>खड्ग प्रहार [SPACE]</span>
        </button>

        <button
          onClick={() => triggerDashRef.current?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/50 text-sky-300 font-bold rounded-xl transition-all active:scale-95"
          title="Dodge Dash [Shift / Right Click]"
        >
          <Zap className="w-4 h-4" />
          <span>गति [SHIFT]</span>
        </button>

        <button
          onClick={() => triggerChakraRef.current?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-bold rounded-xl transition-all active:scale-95"
          title="Sudarshana Chakra [Q / E]"
        >
          <Sparkles className="w-4 h-4" />
          <span>चक्र [Q]</span>
        </button>

        <button
          onClick={() => triggerCleanseRef.current?.()}
          disabled={ultimateCharge < 100}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all ${
            ultimateCharge >= 100
              ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 border border-white shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-bounce active:scale-95 cursor-pointer'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800 opacity-60 cursor-not-allowed'
          }`}
          title="Gayatri Cleanse Nova [R]"
        >
          <Flame className="w-4 h-4 fill-current" />
          <span>गायत्री शुद्धि ({ultimateCharge}%) [R]</span>
        </button>
      </div>

      {/* BOTTOM SPLIT-SCREEN REAL-TIME PARCHMENT AST DIFF & GIT COMMIT STREAM */}
      <div className="absolute bottom-5 left-5 right-5 max-w-4xl mx-auto bg-[#10131e]/95 border border-vedic-gold/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-10 pointer-events-none">
        <div className="flex items-center justify-between text-xs mb-2 border-b border-vedic-gold/20 pb-2 font-devanagari">
          <div className="flex items-center gap-2 text-vedic-gold-bright font-bold">
            <Terminal className="w-4 h-4" />
            <span>ऋत संहिता धारा // LIVE AST STREAM</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#cbbda3] font-mono">
            <span className="flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-sky-400" />
              <span>HEAD: branch feat/rita-cleanse</span>
            </span>
            <span>{recentFixedIssue ? `${recentFixedIssue.filePath}:${recentFixedIssue.line}` : 'Ready for Khanda Strike'}</span>
          </div>
        </div>

        {/* Live Code Diff Viewer */}
        {recentFixedIssue ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
            {/* Dirty Code Before */}
            <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-2.5">
              <div className="text-[10px] text-red-400 font-bold mb-1 flex items-center justify-between font-devanagari">
                <span>दोषपूर्ण कोड (BEFORE):</span>
                <span>Line {recentFixedIssue.line}</span>
              </div>
              <div className="line-through text-red-300 truncate">
                - {recentFixedIssue.rawSnippet}
              </div>
            </div>

            {/* Clean AST Transformed Code */}
            <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-2.5">
              <div className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center justify-between font-devanagari">
                <span>शुद्धीकृत कोड (AST PATCHED):</span>
                <span className="text-emerald-300 font-bold">AUTO-FIXED</span>
              </div>
              <div className="text-emerald-400 font-semibold truncate animate-pulse">
                + {recentFixedIssue.fixedSnippet}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#a89980] italic py-2 flex items-center justify-between font-serif">
            <span>Slash Scorpions (semicolons), Wasps (unused imports), or Goblins (console.logs) to trigger live AST patch!</span>
            <span className="text-vedic-gold-bright text-[11px] font-bold font-devanagari">ऋत इंजन सज्ज</span>
          </div>
        )}

        {/* Live Git Commit Stream */}
        {gitCommits.length > 0 && (
          <div className="mt-2 pt-2 border-t border-vedic-gold/20 flex items-center gap-2 overflow-x-auto text-[10px] text-[#cbbda3] whitespace-nowrap font-mono">
            <span className="text-vedic-gold-bright font-bold font-devanagari">राजकीय अभिलेख:</span>
            {gitCommits.slice(0, 3).map((commit, i) => (
              <span key={i} className="px-2 py-0.5 rounded-lg bg-[#080a14] border border-vedic-gold/30 text-white flex items-center gap-1">
                <code className="text-sky-300 font-bold">{commit.hash}</code>
                <span>{commit.msg}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
