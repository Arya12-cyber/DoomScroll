import React, { useRef, useEffect, useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { sound } from '../../lib/audio/soundEngine';
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
  Radio,
  FileCode,
  GitCommit,
  Maximize2,
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
  type: 'shuriken' | 'boss-bullet';
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

interface BossHydra {
  active: boolean;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  angle: number;
  heads: { x: number; y: number; angle: number; hp: number }[];
}

export const GlitchExterminator: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
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
  } = useTransactionStore();

  const [recentFixedIssue, setRecentFixedIssue] = useState<CodeIssueArtifact | null>(null);
  const [slashesCount, setSlashesCount] = useState(0);
  const [ultimateCharge, setUltimateCharge] = useState(0); // 0 to 100%
  const [dashCooldown, setDashCooldown] = useState(0);
  const [gitCommits, setGitCommits] = useState<
    { hash: string; msg: string; time: string; issueType: string }[]
  >([]);

  // Action refs for on-screen touch/mouse buttons
  const triggerSlashRef = useRef<() => void>(() => {});
  const triggerDashRef = useRef<() => void>(() => {});
  const triggerShurikenRef = useRef<() => void>(() => {});
  const triggerCleanseRef = useRef<() => void>(() => {});

  const stateRef = useRef({
    hero: {
      x: 400,
      y: 400,
      vx: 0,
      vy: 0,
      radius: 22,
      angle: 0,
      speed: 6.2,
      isSlashing: false,
      slashTime: 0,
      slashRadius: 72,
      comboStep: 0, // 0, 1, 2 for multi-hit swing
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
      radius: 55,
      angle: 0,
      heads: [
        { x: -35, y: -25, angle: 0, hp: 150 },
        { x: 0, y: -45, angle: 0, hp: 150 },
        { x: 35, y: -25, angle: 0, hp: 150 },
      ],
    } as BossHydra,
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

    sound.init();

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

    // Initial spawn of code bugs
    const unfixedIssues = codeIssues.filter((c) => c.status === 'unfixed');
    const initialBugs = unfixedIssues.slice(0, 15);

    const typeMetaMap: Record<string, any> = {
      'missing-semicolon': { type: 'semicolon', name: '; Scorpion', color: '#ff0055', glow: 'rgba(255, 0, 85, 0.6)' },
      'unused-import': { type: 'unused-import', name: 'Import Wasp', color: '#00f3ff', glow: 'rgba(0, 243, 255, 0.6)' },
      'console-log': { type: 'console-log', name: 'Console Goblin', color: '#ffaa00', glow: 'rgba(255, 170, 0, 0.6)' },
      'var-to-const': { type: 'var-to-const', name: 'Var Slug', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' },
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

    // Helper: Add Particle Bursts with optional glyphs (;, {}, //)
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

    // Trigger Katana Slash Combo
    const triggerSlash = () => {
      const hero = stateRef.current.hero;
      hero.isSlashing = true;
      hero.slashTime = performance.now();
      hero.comboStep = (hero.comboStep + 1) % 3;
      sound.playSwordSlash();

      const bugs = stateRef.current.bugs;
      const boss = stateRef.current.boss;

      // Check Hits on Bugs
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

          if (angleDiff < Math.PI * 0.72 || dist < hero.radius + 20) {
            // Hit Enemy Bug!
            bug.hp -= 1;
            addParticles(bug.x, bug.y, bug.color, 12);
            sound.playBugSplat();

            if (bug.hp <= 0) {
              bugs.splice(i, 1);
              addParticles(bug.x, bug.y, bug.color, 28, bug.type === 'semicolon' ? ';' : '{}');
              stateRef.current.screenShake = 9;

              // Physical Chore Execution!
              fixCodeIssue(bug.id);
              setRecentFixedIssue(bug.issue);
              setSlashesCount((prev) => prev + 1);

              // Add Simulated Git Commit to Stream
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

              // Charge Ultimate Meter
              setUltimateCharge((prev) => Math.min(100, prev + 12));

              addFloatingText(bug.x, bug.y - 18, `PURGED: ${bug.name}`, bug.color);
              addScore(280);
              incrementCombo();

              // Summon Boss when 8 bugs are slain!
              if (bugs.length === 5 && !boss.active) {
                boss.active = true;
                boss.hp = boss.maxHp;
                sound.playExplosion('boss');
                addFloatingText(canvas.width / 2, 120, '⚠️ BOSS: SPAGHETTI GLITCH HYDRA!', '#ff0055');
              }
            }
          }
        }
      }

      // Check Hits on Boss Hydra
      if (boss.active) {
        const bdx = boss.x - hero.x;
        const bdy = boss.y - hero.y;
        const bdist = Math.hypot(bdx, bdy);

        if (bdist < hero.slashRadius + boss.radius) {
          boss.hp -= 35;
          addParticles(hero.x + (bdx / bdist) * 40, hero.y + (bdy / bdist) * 40, '#ff0055', 18);
          sound.playExplosion('small');
          stateRef.current.screenShake = 12;

          if (boss.hp <= 0) {
            boss.active = false;
            sound.playPrettierCleanse();
            stateRef.current.screenShake = 22;
            addParticles(boss.x, boss.y, '#00ff66', 60);
            addFloatingText(boss.x, boss.y, '🏆 PRETTIER FULL REPO FORMAT PASSED!', '#00ff66');
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
      sound.playDashWhoosh();

      setDashCooldown(100);
      setTimeout(() => setDashCooldown(0), 450);
    };

    // AST Laser Shuriken Throw
    const triggerShuriken = () => {
      const hero = stateRef.current.hero;
      sound.playShurikenThrow();

      [-0.18, 0, 0.18].forEach((offsetAngle) => {
        const fireAngle = hero.angle + offsetAngle;
        const speed = 14;
        stateRef.current.projectiles.push({
          x: hero.x + Math.cos(fireAngle) * 20,
          y: hero.y + Math.sin(fireAngle) * 20,
          vx: Math.cos(fireAngle) * speed,
          vy: Math.sin(fireAngle) * speed,
          radius: 6,
          type: 'shuriken',
          color: '#00f3ff',
          life: 0,
          maxLife: 45,
        });
      });

      addParticles(hero.x, hero.y, '#00f3ff', 8);
    };

    // Ultimate Prettier Cleanse Nova
    const triggerUltimateCleanse = () => {
      if (stateRef.current.ultimateCharge < 100) return;

      sound.playPrettierCleanse();
      stateRef.current.cleanseNova.active = true;
      stateRef.current.cleanseNova.radius = 10;
      stateRef.current.screenShake = 20;
      setUltimateCharge(0);

      // Instantly auto-fix and vaporize all bugs on screen
      const bugs = stateRef.current.bugs;
      bugs.forEach((bug) => {
        fixCodeIssue(bug.id);
        addParticles(bug.x, bug.y, '#00ff66', 20, ';');
      });
      stateRef.current.bugs = [];

      addFloatingText(canvas.width / 2, canvas.height / 2, '⚡ AST GLOBAL CLEANSE: ALL CODE SMELLS PURGED!', '#00ff66');
      addScore(2500);
    };

    // Store callbacks for UI buttons
    triggerSlashRef.current = triggerSlash;
    triggerDashRef.current = triggerDash;
    triggerShurikenRef.current = triggerShuriken;
    triggerCleanseRef.current = triggerUltimateCleanse;

    // Keyboard & Mouse Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
        triggerSlash();
      } else if (e.key === 'Shift') {
        triggerDash();
      } else if (e.key === 'q' || e.key === 'Q' || e.key === 'e' || e.key === 'E') {
        triggerShuriken();
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
        triggerShuriken();
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
    let dungeonLightPulse = 0;

    const loop = (currentTime: number) => {
      dungeonLightPulse += 0.03;
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

        // Leave afterimage ghost trails
        hero.ghostTrails.push({ x: hero.x, y: hero.y, angle: hero.angle, alpha: 0.6 });

        if (currentTime - hero.dashTime > 160) {
          hero.isDashing = false;
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

      // Constrain hero in arena
      hero.x = Math.max(hero.radius + 15, Math.min(canvas.width - hero.radius - 15, hero.x));
      hero.y = Math.max(hero.radius + 15, Math.min(canvas.height - hero.radius - 15, hero.y));

      // Slash Animation Expiry
      if (hero.isSlashing && currentTime - hero.slashTime > 150) {
        hero.isSlashing = false;
      }

      // Update Dash Ghosts
      for (let i = hero.ghostTrails.length - 1; i >= 0; i--) {
        hero.ghostTrails[i].alpha -= 0.08;
        if (hero.ghostTrails[i].alpha <= 0) hero.ghostTrails.splice(i, 1);
      }

      // 2. Update Cleanse Nova
      if (cleanseNova.active) {
        cleanseNova.radius += 35;
        if (cleanseNova.radius > cleanseNova.maxRadius) {
          cleanseNova.active = false;
        }
      }

      // 3. Update Projectiles (AST Laser Shurikens)
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        // Collision with Bugs
        for (let j = bugs.length - 1; j >= 0; j--) {
          const bug = bugs[j];
          const dist = Math.hypot(bug.x - p.x, bug.y - p.y);
          if (dist < bug.radius + p.radius) {
            bug.hp -= 1;
            addParticles(p.x, p.y, p.color, 10);
            sound.playBugSplat();
            projectiles.splice(i, 1);

            if (bug.hp <= 0) {
              bugs.splice(j, 1);
              fixCodeIssue(bug.id);
              addParticles(bug.x, bug.y, bug.color, 24, ';');
              addScore(250);
              incrementCombo();
              setUltimateCharge((prev) => Math.min(100, prev + 10));
            }
            break;
          }
        }

        if (p.life >= p.maxLife) {
          projectiles.splice(i, 1);
        }
      }

      // 4. Continuous Bug Spawning
      if (bugs.length < 14 && currentTime - state.lastSpawnTime > 1000) {
        state.lastSpawnTime = currentTime;
        const remainingUnfixed = codeIssues.filter(
          (c) => c.status === 'unfixed' && !bugs.some((b) => b.id === c.id)
        );
        if (remainingUnfixed.length > 0) {
          const issue = remainingUnfixed[Math.floor(Math.random() * remainingUnfixed.length)];
          const edge = Math.floor(Math.random() * 4);
          let sx = 0, sy = 0;
          if (edge === 0) { sx = Math.random() * canvas.width; sy = -25; }
          else if (edge === 1) { sx = canvas.width + 25; sy = Math.random() * canvas.height; }
          else if (edge === 2) { sx = Math.random() * canvas.width; sy = canvas.height + 25; }
          else { sx = -25; sy = Math.random() * canvas.height; }

          const meta = typeMetaMap[issue.issueType] || typeMetaMap['missing-semicolon'];
          bugs.push({
            id: issue.id,
            issue,
            x: sx,
            y: sy,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: meta.type === 'console-log' ? 24 : 19,
            hp: meta.type === 'console-log' ? 2 : 1,
            maxHp: meta.type === 'console-log' ? 2 : 1,
            type: meta.type,
            name: meta.name,
            color: meta.color,
            glowColor: meta.glow,
            lungeTimer: 0,
            wingPhase: 0,
          });
        }
      }

      // 5. Update Bugs AI (Scorpions lunge, Wasps hover, Goblins charge)
      bugs.forEach((bug) => {
        bug.wingPhase += 0.25;
        const dx = hero.x - bug.x;
        const dy = hero.y - bug.y;
        const dist = Math.hypot(dx, dy);

        if (bug.type === 'unused-import') {
          // Hovering Wasp sinusoidal motion
          const perpX = -dy / (dist || 1);
          const perpY = dx / (dist || 1);
          bug.vx += ((dx / dist) * 0.12 + perpX * Math.sin(bug.wingPhase) * 0.35);
          bug.vy += ((dy / dist) * 0.12 + perpY * Math.sin(bug.wingPhase) * 0.35);
        } else if (bug.type === 'semicolon') {
          // Skittering Scorpion with lunges
          bug.lungeTimer += 1;
          const isLunging = bug.lungeTimer % 90 > 75;
          const speedFactor = isLunging ? 0.35 : 0.09;
          bug.vx += (dx / (dist || 1)) * speedFactor;
          bug.vy += (dy / (dist || 1)) * speedFactor;
        } else {
          // Heavy tank goblin
          bug.vx += (dx / (dist || 1)) * 0.07;
          bug.vy += (dy / (dist || 1)) * 0.07;
        }

        bug.vx *= 0.95;
        bug.vy *= 0.95;
        bug.x += bug.vx;
        bug.y += bug.vy;
      });

      // 6. Update Boss Hydra
      if (boss.active) {
        boss.angle += 0.015;
        // Float in top half
        boss.x = canvas.width / 2 + Math.sin(currentTime * 0.0015) * (canvas.width * 0.25);
        boss.y = 150 + Math.cos(currentTime * 0.002) * 35;
      }

      // 7. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      // 8. Update Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.018;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // ==========================================
      // 9. RENDER CANVAS SCENE
      // ==========================================
      ctx.save();
      if (state.screenShake > 0 && isScreenShakeEnabled) {
        ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
        state.screenShake = Math.max(0, state.screenShake - 0.5);
      }

      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Dungeon Floor Grid & Circuit Pathways
      ctx.strokeStyle = '#0e1422';
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

      // Circuit node glows
      ctx.fillStyle = `rgba(0, 255, 102, ${0.08 + Math.sin(dungeonLightPulse) * 0.04})`;
      ctx.beginPath();
      ctx.arc(hero.x, hero.y, 160, 0, Math.PI * 2);
      ctx.fill();

      // Cleanse Nova Ring Expansion
      if (cleanseNova.active) {
        ctx.save();
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 35;
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, cleanseNova.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render Projectiles (AST Shurikens)
      projectiles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;

        ctx.fillStyle = p.color;
        // 4-pointed spinning shuriken
        ctx.rotate(currentTime * 0.03);
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 2);
        ctx.lineTo(p.radius * 0.5, -p.radius * 0.5);
        ctx.lineTo(p.radius * 2, 0);
        ctx.lineTo(p.radius * 0.5, p.radius * 0.5);
        ctx.lineTo(0, p.radius * 2);
        ctx.lineTo(-p.radius * 0.5, p.radius * 0.5);
        ctx.lineTo(-p.radius * 2, 0);
        ctx.lineTo(-p.radius * 0.5, -p.radius * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // Render Bugs
      bugs.forEach((bug) => {
        ctx.save();
        ctx.translate(bug.x, bug.y);
        ctx.shadowColor = bug.glowColor;
        ctx.shadowBlur = 16;

        ctx.fillStyle = bug.color;

        if (bug.type === 'semicolon') {
          // Semicolon Scorpion
          ctx.beginPath();
          ctx.ellipse(0, 0, bug.radius, bug.radius * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();

          // Scorpion tail with ; curve
          ctx.strokeStyle = bug.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, -bug.radius * 1.2, 10, 0, Math.PI);
          ctx.stroke();

          // Semicolon stinger dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(10, -bug.radius * 1.4, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (bug.type === 'unused-import') {
          // Import Wasp (Wings flapping)
          ctx.beginPath();
          ctx.arc(0, 0, bug.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Wings
          ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
          const wingSpan = Math.sin(bug.wingPhase) * 16;
          ctx.beginPath();
          ctx.ellipse(-12, -4, 10, Math.abs(wingSpan), 0.4, 0, Math.PI * 2);
          ctx.ellipse(12, -4, 10, Math.abs(wingSpan), -0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Console Goblin (Heavy Armor Shield)
          ctx.beginPath();
          ctx.arc(0, 0, bug.radius, 0, Math.PI * 2);
          ctx.fill();

          // Terminal shield
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-12, -12, 24, 24);
          ctx.strokeStyle = bug.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(-12, -12, 24, 24);
        }

        // Bug core glyph
        ctx.shadowBlur = 0;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#0a0d14';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbol = bug.type === 'semicolon' ? ';' : bug.type === 'unused-import' ? 'IMP' : 'LOG';
        ctx.fillText(symbol, 0, 0);

        // Name Tag
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(bug.name, 0, bug.radius + 14);

        ctx.restore();
      });

      // Render Boss Hydra
      if (boss.active) {
        ctx.save();
        ctx.translate(boss.x, boss.y);
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 30;

        // Hydra Core
        ctx.fillStyle = '#4c0519';
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, boss.radius, boss.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3 Hydra Heads
        boss.heads.forEach((h, idx) => {
          const sway = Math.sin(currentTime * 0.003 + idx) * 15;
          ctx.fillStyle = '#ff0055';
          ctx.beginPath();
          ctx.arc(h.x + sway, h.y, 18, 0, Math.PI * 2);
          ctx.fill();

          // Connecting neck
          ctx.strokeStyle = '#881337';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(h.x + sway, h.y);
          ctx.stroke();
        });

        // Boss Health Bar
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-70, -65, 140, 10);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(-70, -65, (boss.hp / boss.maxHp) * 140, 10);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(-70, -65, 140, 10);

        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fda4af';
        ctx.textAlign = 'center';
        ctx.fillText(`SPAGHETTI GLITCH HYDRA (${boss.hp}/${boss.maxHp})`, 0, -72);

        ctx.restore();
      }

      // Render Hero Ghost Trails (Dash Afterimages)
      hero.ghostTrails.forEach((trail) => {
        ctx.save();
        ctx.translate(trail.x, trail.y);
        ctx.rotate(trail.angle);
        ctx.fillStyle = `rgba(0, 255, 102, ${trail.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(0, 0, hero.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Hero (Emerald Blade Operative)
      ctx.save();
      ctx.translate(hero.x, hero.y);
      ctx.rotate(hero.angle);

      // Katana Blade Slash Arc Wave
      if (hero.isSlashing) {
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 28;
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(0, 0, hero.slashRadius, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, hero.slashRadius - 2, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      }

      // Hero Body
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00ff66';
      ctx.beginPath();
      ctx.arc(0, 0, hero.radius, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Visor
      ctx.fillStyle = '#05140b';
      ctx.fillRect(hero.radius * 0.25, -6, hero.radius * 0.65, 12);

      // Katana Blade
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hero.radius * 0.6, -2.5, 32, 5);

      ctx.restore();

      // Render Particles (Including syntax symbols)
      particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        if (p.glyph) {
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.glyph, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Render Floating Combat Texts
      floatingTexts.forEach((ft) => {
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
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
  }, [codeIssues]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#06080e] overflow-hidden select-none font-mono text-slate-100">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 text-xs">
        {/* Left: Score & Bug Counters */}
        <div className="flex items-center gap-3 bg-[#0d111a]/85 border border-matrix-green/40 backdrop-blur-md px-4 py-2 rounded-xl shadow-neon-matrix">
          <button
            onClick={onBackToHub}
            className="pointer-events-auto p-1 hover:bg-matrix-green/20 text-matrix-green rounded transition-colors"
            title="Return to Cabinet Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-matrix-green tracking-wider font-bold">MODULE D // GLITCH EXTERMINATOR</div>
            <div className="text-sm font-extrabold text-white">SCORE: {stats.score.toLocaleString()}</div>
          </div>
          <div className="h-6 w-px bg-matrix-green/30" />
          <div>
            <div className="text-[10px] text-slate-400">BUGS SLAIN</div>
            <div className="text-sm font-bold text-matrix-green">{stats.codeSmellsPurged}</div>
          </div>
          <div className="h-6 w-px bg-matrix-green/30" />
          <div>
            <div className="text-[10px] text-slate-400">PENDING SMELLS</div>
            <div className="text-sm font-bold text-red-400">
              {codeIssues.filter((c) => c.status === 'unfixed').length}
            </div>
          </div>
        </div>

        {/* Center: Combo Multiplier & Ultimate Meter */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {stats.combo > 1 && (
            <div className="bg-gradient-to-r from-emerald-950 to-green-950 border border-matrix-green/60 px-4 py-1.5 rounded-full text-matrix-green font-bold animate-pulse shadow-neon-matrix flex items-center gap-2">
              <Zap className="w-4 h-4 text-matrix-green fill-matrix-green" />
              <span>KATANA COMBO x{stats.combo}</span>
            </div>
          )}

          {/* Ultimate Prettier Cleanse Gauge */}
          <button
            onClick={() => {
              if (ultimateCharge >= 100) {
                sound.playPrettierCleanse();
                stateRef.current.cleanseNova.active = true;
                stateRef.current.cleanseNova.radius = 10;
                setUltimateCharge(0);
                const bugs = stateRef.current.bugs;
                bugs.forEach((b) => fixCodeIssue(b.id));
                stateRef.current.bugs = [];
                addScore(2500);
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-md ${
              ultimateCharge >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 border-white shadow-[0_0_25px_rgba(0,255,102,0.8)] animate-bounce cursor-pointer'
                : 'bg-slate-900/80 text-slate-400 border-slate-700'
            }`}
            title="Press [R] for Global Prettier Cleanse Nova"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>CLEANSE NOVA: {ultimateCharge}% [R]</span>
          </button>
        </div>

        {/* Right: Reality View */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-matrix-green/60 text-matrix-green rounded-lg font-bold transition-all shadow-md active:scale-95 text-xs"
          >
            <Eye className="w-3.5 h-3.5 text-matrix-green" />
            <span>Live AST Diff [Tab]</span>
          </button>
        </div>
      </div>

      {/* ON-SCREEN TACTILE COMBAT ACTIONS DOCK */}
      <div className="absolute bottom-[170px] left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-[#0d111a]/95 border border-matrix-green/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl z-20 font-mono text-xs shadow-2xl pointer-events-auto">
        <button
          onClick={() => triggerSlashRef.current?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-matrix-green/20 hover:bg-matrix-green/30 border border-matrix-green text-matrix-green font-black rounded-xl transition-all active:scale-95 shadow-neon-matrix"
          title="Katana Combo Slash [Space / Left Click]"
        >
          <Sword className="w-4 h-4 fill-current" />
          <span>SLASH [SPACE]</span>
        </button>

        <button
          onClick={() => triggerDashRef.current?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold rounded-xl transition-all active:scale-95"
          title="Dodge Dash [Shift / Right Click]"
        >
          <Zap className="w-4 h-4" />
          <span>DASH [SHIFT]</span>
        </button>

        <button
          onClick={() => triggerShurikenRef.current?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold rounded-xl transition-all active:scale-95"
          title="AST Laser Shurikens [Q / E]"
        >
          <Sparkles className="w-4 h-4" />
          <span>SHURIKEN [Q]</span>
        </button>

        <button
          onClick={() => triggerCleanseRef.current?.()}
          disabled={ultimateCharge < 100}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition-all ${
            ultimateCharge >= 100
              ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 border border-white shadow-[0_0_20px_rgba(0,255,102,0.8)] animate-bounce active:scale-95 cursor-pointer'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800 opacity-60 cursor-not-allowed'
          }`}
          title="Global Prettier Cleanse Nova [R]"
        >
          <Flame className="w-4 h-4 fill-current" />
          <span>CLEANSE ({ultimateCharge}%) [R]</span>
        </button>
      </div>

      {/* BOTTOM SPLIT-SCREEN REAL-TIME AST DIFF & GIT COMMIT DOCK */}
      <div className="absolute bottom-5 left-5 right-5 max-w-4xl mx-auto bg-[#0a0d17]/95 border border-matrix-green/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-10 pointer-events-none">
        <div className="flex items-center justify-between text-xs mb-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-matrix-green font-bold">
            <Terminal className="w-4 h-4" />
            <span>REAL-TIME AST STREAM // GIT COMMIT LOG</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-cyan-400" />
              <span>HEAD: branch feat/ast-cleanse</span>
            </span>
            <span>{recentFixedIssue ? `${recentFixedIssue.filePath}:${recentFixedIssue.line}` : 'Ready for Katana Strike'}</span>
          </div>
        </div>

        {/* Live Code Diff Viewer */}
        {recentFixedIssue ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
            {/* Dirty Code Before */}
            <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-2.5">
              <div className="text-[10px] text-red-400 font-bold mb-1 flex items-center justify-between">
                <span>BEFORE (DIRTY SYNTAX):</span>
                <span>Line {recentFixedIssue.line}</span>
              </div>
              <div className="line-through text-red-300 font-mono truncate">
                - {recentFixedIssue.rawSnippet}
              </div>
            </div>

            {/* Clean AST Transformed Code */}
            <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-2.5">
              <div className="text-[10px] text-matrix-green font-bold mb-1 flex items-center justify-between">
                <span>AFTER (AST PATCHED):</span>
                <span className="text-emerald-400 font-bold">AUTO-FIXED</span>
              </div>
              <div className="text-matrix-green font-mono font-semibold truncate animate-pulse">
                + {recentFixedIssue.fixedSnippet}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-2 flex items-center justify-between">
            <span>Slash Scorpions (semicolons), Wasps (unused imports), or Goblins (console.logs) to trigger live AST patch!</span>
            <span className="text-matrix-green text-[11px] font-bold">AST Engine Standing By</span>
          </div>
        )}

        {/* Live Git Commit Stream Pill Ticker */}
        {gitCommits.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[10px] text-slate-400 whitespace-nowrap">
            <span className="text-slate-500 font-bold">LATEST COMMITS:</span>
            {gitCommits.slice(0, 3).map((commit, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1">
                <code className="text-cyan-300 font-bold">{commit.hash}</code>
                <span>{commit.msg}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Control Bar Guide */}
      <div className="absolute bottom-5 right-5 text-[10px] text-slate-400 font-mono bg-black/60 px-3 py-1.5 rounded border border-slate-800 pointer-events-none hidden lg:block">
        Slash: [Click / Space] | Dash: [Shift / Right Click] | Shuriken: [Q / E] | Cleanse Nova: [R]
      </div>
    </div>
  );
};
