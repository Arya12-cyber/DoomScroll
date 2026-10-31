import React, { useRef, useEffect, useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { sound } from '../../lib/audio/soundEngine';
import { EmailArtifact } from '../../types';
import {
  Shield,
  Zap,
  Sparkles,
  ArrowLeft,
  Eye,
  Crosshair,
  Flame,
  Radio,
  Sliders,
  MousePointer,
} from 'lucide-react';

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

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'laser' | 'emp' | 'tractor';
  color: string;
}

interface EnemyShip {
  id: string;
  email: EmailArtifact;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  type: 'spam' | 'newsletter' | 'receipt' | 'boss';
  color: string;
  glowColor: string;
}

export const NebulaPurge: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    emails,
    trashEmail,
    unsubscribeEmail,
    archiveReceiptEmail,
    bulkNukeEmails,
    addScore,
    incrementCombo,
    resetCombo,
    stats,
    toggleRealityLens,
    isScreenShakeEnabled,
  } = useTransactionStore();

  const [screenShake, setScreenShake] = useState(0);
  const [activeWeapon, setActiveWeapon] = useState<'laser' | 'emp' | 'tractor'>('laser');
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(2000);
  const [unreadsVaporized, setUnreadsVaporized] = useState(0);
  const [autoFire, setAutoFire] = useState(false);
  const [isFiringManual, setIsFiringManual] = useState(false);

  // References for 60fps game loop state
  const stateRef = useRef({
    player: {
      x: 400,
      y: 500,
      targetX: 400,
      targetY: 500,
      vx: 0,
      vy: 0,
      angle: 0,
      radius: 20,
      speed: 7.2,
      shield: 100,
    },
    keys: {} as Record<string, boolean>,
    mouse: { x: 400, y: 500, isDown: false },
    touch: { active: false, x: 400, y: 500 },
    bullets: [] as Bullet[],
    enemies: [] as EnemyShip[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    stars: [] as { x: number; y: number; speed: number; size: number; alpha: number }[],
    lastShotTime: 0,
    lastEnemySpawnTime: 0,
    activeWeapon: 'laser' as 'laser' | 'emp' | 'tractor',
    autoFire: false,
    isFiringManual: false,
    unreadsVaporized: 0,
  });

  // Sync state refs for loop
  useEffect(() => {
    stateRef.current.activeWeapon = activeWeapon;
  }, [activeWeapon]);

  useEffect(() => {
    stateRef.current.autoFire = autoFire;
  }, [autoFire]);

  useEffect(() => {
    stateRef.current.isFiringManual = isFiringManual;
  }, [isFiringManual]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sound.init();

    // Responsive Canvas Resizing
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        if (stateRef.current.player.x === 400 && stateRef.current.player.y === 500) {
          stateRef.current.player.x = canvas.width / 2;
          stateRef.current.player.y = canvas.height - 90;
          stateRef.current.player.targetX = stateRef.current.player.x;
          stateRef.current.player.targetY = stateRef.current.player.y;
        }
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Starfield initialization
    const stars = [];
    for (let i = 0; i < 140; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.4 + Math.random() * 2.8,
        size: Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.8,
      });
    }
    stateRef.current.stars = stars;

    // Helper: Particles
    const addParticles = (x: number, y: number, color: string, count = 18) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 5;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 2.5,
          color,
          alpha: 1,
          life: 0,
          maxLife: 20 + Math.random() * 20,
        });
      }
    };

    // Helper: Floating Text
    const addFloatingText = (x: number, y: number, text: string, color: string) => {
      stateRef.current.floatingTexts.push({
        id: Math.random().toString(),
        x,
        y,
        text,
        color,
        alpha: 1,
        vy: -1.4,
      });
    };

    // Enemy Spawning
    const spawnEnemy = () => {
      const unreadEmails = emails.filter((e) => e.status === 'unread');
      if (unreadEmails.length === 0) return;

      const randomEmail = unreadEmails[Math.floor(Math.random() * unreadEmails.length)];
      const x = 50 + Math.random() * (canvas.width - 100);
      const y = -30;

      let type: 'spam' | 'newsletter' | 'receipt' = 'spam';
      let color = '#ff0055'; // Neon Crimson for Spam
      let glowColor = 'rgba(255, 0, 85, 0.65)';
      let maxHp = 1;

      if (randomEmail.type === 'newsletter') {
        type = 'newsletter';
        color = '#a855f7'; // Neon Purple for Newsletter
        glowColor = 'rgba(168, 85, 247, 0.65)';
        maxHp = 2;
      } else if (randomEmail.type === 'receipt') {
        type = 'receipt';
        color = '#ffaa00'; // Neon Gold for Receipt Cargo
        glowColor = 'rgba(255, 170, 0, 0.65)';
        maxHp = 1;
      }

      stateRef.current.enemies.push({
        id: randomEmail.id,
        email: randomEmail,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.6,
        vy: 1.2 + Math.random() * 1.5,
        radius: type === 'newsletter' ? 22 : type === 'receipt' ? 18 : 16,
        hp: maxHp,
        maxHp,
        type,
        color,
        glowColor,
      });
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === '1') setActiveWeapon('laser');
      if (e.key === '2') setActiveWeapon('emp');
      if (e.key === '3') setActiveWeapon('tractor');
      if (e.key === 'f' || e.key === 'F') setAutoFire((prev) => !prev);
      if (e.key === 'b' || e.key === 'B') {
        setBossActive(true);
        setBossHp(2000);
        sound.playExplosion('boss');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    // Mouse Controls
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      stateRef.current.mouse.x = mx;
      stateRef.current.mouse.y = my;

      if (stateRef.current.mouse.isDown) {
        stateRef.current.player.targetX = mx;
        stateRef.current.player.targetY = my;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.mouse.isDown = true;
        const rect = canvas.getBoundingClientRect();
        stateRef.current.player.targetX = e.clientX - rect.left;
        stateRef.current.player.targetY = e.clientY - rect.top;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) stateRef.current.mouse.isDown = false;
    };

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches.length > 0) {
        const tx = e.touches[0].clientX - rect.left;
        const ty = e.touches[0].clientY - rect.top;
        stateRef.current.touch.active = true;
        stateRef.current.touch.x = tx;
        stateRef.current.touch.y = ty;
        stateRef.current.player.targetX = tx;
        stateRef.current.player.targetY = ty;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches.length > 0) {
        const tx = e.touches[0].clientX - rect.left;
        const ty = e.touches[0].clientY - rect.top;
        stateRef.current.touch.x = tx;
        stateRef.current.touch.y = ty;
        stateRef.current.player.targetX = tx;
        stateRef.current.player.targetY = ty;
      }
    };

    const handleTouchEnd = () => {
      stateRef.current.touch.active = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // ==========================================
    // 60 FPS ULTRA-SMOOTH GAME LOOP
    // ==========================================
    let animationId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const {
        player,
        keys,
        mouse,
        touch,
        bullets,
        enemies,
        particles,
        floatingTexts,
        stars,
      } = state;

      // 1. Smooth Flight Kinematics & Banking Lerp
      let moveDirX = 0;
      let moveDirY = 0;

      if (keys['a'] || keys['arrowleft']) moveDirX -= 1;
      if (keys['d'] || keys['arrowright']) moveDirX += 1;
      if (keys['w'] || keys['arrowup']) moveDirY -= 1;
      if (keys['s'] || keys['arrowdown']) moveDirY += 1;

      if (moveDirX !== 0 || moveDirY !== 0) {
        // Direct Keyboard Flight with momentum
        const len = Math.hypot(moveDirX, moveDirY) || 1;
        const targetVx = (moveDirX / len) * player.speed;
        const targetVy = (moveDirY / len) * player.speed;

        player.vx += (targetVx - player.vx) * 0.22;
        player.vy += (targetVy - player.vy) * 0.22;
        player.x += player.vx;
        player.y += player.vy;
        player.targetX = player.x;
        player.targetY = player.y;
      } else if (mouse.isDown || touch.active) {
        // Smooth Cursor / Touch Glide (Lerp with spring dampening)
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        player.vx = dx * 0.16;
        player.vy = dy * 0.16;
        player.x += player.vx;
        player.y += player.vy;
      } else {
        // Inertia friction decay
        player.vx *= 0.88;
        player.vy *= 0.88;
        player.x += player.vx;
        player.y += player.vy;
      }

      // Smooth banking angle according to lateral speed
      const targetAngle = (player.vx / player.speed) * 0.45;
      player.angle += (targetAngle - player.angle) * 0.18;

      // Arena boundary limits
      player.x = Math.max(player.radius + 10, Math.min(canvas.width - player.radius - 10, player.x));
      player.y = Math.max(player.radius + 10, Math.min(canvas.height - player.radius - 10, player.y));

      // Thruster flame particles
      if (Math.random() > 0.3) {
        const exhaustY = player.y + player.radius * 0.9;
        particles.push({
          x: player.x + (Math.random() - 0.5) * 8,
          y: exhaustY,
          vx: -player.vx * 0.2 + (Math.random() - 0.5) * 1,
          vy: 3 + Math.random() * 4,
          radius: 1.5 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#00f3ff' : '#ffaa00',
          alpha: 0.85,
          life: 0,
          maxLife: 15,
        });
      }

      // 2. Weapon Firing Logic
      const shouldShoot =
        state.autoFire ||
        keys[' '] ||
        mouse.isDown ||
        touch.active ||
        state.isFiringManual;

      const shootInterval =
        state.activeWeapon === 'emp' ? 240 : state.activeWeapon === 'tractor' ? 170 : 110;

      if (shouldShoot && currentTime - state.lastShotTime > shootInterval) {
        state.lastShotTime = currentTime;

        if (state.activeWeapon === 'laser') {
          sound.playLaser();
          // Twin high-energy lasers
          bullets.push({
            x: player.x - 11,
            y: player.y - 14,
            vx: player.vx * 0.1,
            vy: -15,
            type: 'laser',
            color: '#00f3ff',
          });
          bullets.push({
            x: player.x + 11,
            y: player.y - 14,
            vx: player.vx * 0.1,
            vy: -15,
            type: 'laser',
            color: '#00f3ff',
          });
        } else if (state.activeWeapon === 'emp') {
          sound.playEMP();
          // 3-way EMP missile spread
          [-3.5, 0, 3.5].forEach((spreadVx) => {
            bullets.push({
              x: player.x,
              y: player.y - 16,
              vx: spreadVx,
              vy: -11,
              type: 'emp',
              color: '#a855f7',
            });
          });
        } else if (state.activeWeapon === 'tractor') {
          sound.playTractorBeam();
          // Tractor beam core pulse
          bullets.push({
            x: player.x,
            y: player.y - 16,
            vx: 0,
            vy: -13,
            type: 'tractor',
            color: '#ffaa00',
          });
        }
      }

      // 3. Regular Enemy Spawns
      if (currentTime - state.lastEnemySpawnTime > 650) {
        state.lastEnemySpawnTime = currentTime;
        spawnEnemy();
      }

      // 4. Update Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        if (b.y < -25 || b.x < -25 || b.x > canvas.width + 25) {
          bullets.splice(i, 1);
        }
      }

      // 5. Update Enemies & Collision Resolution
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Sidewall ricochet
        if (enemy.x < enemy.radius || enemy.x > canvas.width - enemy.radius) {
          enemy.vx *= -1;
        }

        // Bullet vs Enemy
        for (let j = bullets.length - 1; j >= 0; j--) {
          const bullet = bullets[j];
          const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);

          if (dist < enemy.radius + 7) {
            bullets.splice(j, 1);
            enemy.hp -= 1;
            addParticles(bullet.x, bullet.y, bullet.color, 7);

            if (enemy.hp <= 0) {
              enemies.splice(i, 1);
              addParticles(enemy.x, enemy.y, enemy.color, 26);
              sound.playExplosion('small');
              setScreenShake(isScreenShakeEnabled ? 7 : 0);

              // Background Chore Physical Execution
              if (enemy.type === 'spam') {
                trashEmail(enemy.id);
                addFloatingText(enemy.x, enemy.y, `TRASH_EMAIL (-${enemy.email.sizeKb}KB)`, '#ff0055');
              } else if (enemy.type === 'newsletter') {
                unsubscribeEmail(enemy.id);
                addFloatingText(enemy.x, enemy.y, 'UNSUBSCRIBED & ARCHIVED', '#a855f7');
              } else if (enemy.type === 'receipt') {
                archiveReceiptEmail(enemy.id);
                addFloatingText(enemy.x, enemy.y, 'FILED TO TAX RECEIPTS', '#ffaa00');
              }

              state.unreadsVaporized += 1;
              setUnreadsVaporized(state.unreadsVaporized);
              addScore(160);
              incrementCombo();
              break;
            }
          }
        }

        // Off-screen purge
        if (enemy.y > canvas.height + 40) {
          enemies.splice(i, 1);
          resetCombo();
        }
      }

      // 6. Boss Mothership ("The 2021 Backlog")
      if (bossActive) {
        const bossX = canvas.width / 2 + Math.sin(currentTime * 0.002) * (canvas.width * 0.36);
        const bossY = 115;

        for (let j = bullets.length - 1; j >= 0; j--) {
          const bullet = bullets[j];
          const dist = Math.hypot(bossX - bullet.x, bossY - bullet.y);

          if (dist < 72) {
            bullets.splice(j, 1);
            addParticles(bullet.x, bullet.y, '#00f3ff', 8);
            sound.playExplosion('small');

            setBossHp((prev) => {
              const next = Math.max(0, prev - 25);
              if (next % 200 === 0 && next > 0) {
                bulkNukeEmails(25);
                sound.playExplosion('medium');
                setScreenShake(isScreenShakeEnabled ? 14 : 0);
                addFloatingText(bossX, bossY + 45, '⚡ BULK NUKE (25 EMAILS DISINTEGRATED)', '#00f3ff');
              }
              if (next <= 0) {
                setBossActive(false);
                sound.playExplosion('boss');
                setScreenShake(isScreenShakeEnabled ? 22 : 0);
                bulkNukeEmails(100);
                addFloatingText(bossX, bossY, '🏆 THE 2021 BACKLOG PURGED! +5,000 PTS', '#ffaa00');
                addScore(5000);
              }
              return next;
            });
          }
        }
      }

      // 7. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // 8. Update Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.015;
        if (ft.alpha <= 0) {
          floatingTexts.splice(i, 1);
        }
      }

      // 9. Update Starfield
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      // 10. RENDER CANVAS
      ctx.save();

      // Screen Shake
      if (screenShake > 0 && isScreenShakeEnabled) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
        setScreenShake((prev) => Math.max(0, prev - 0.5));
      }

      // Space Backdrop
      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield
      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Render Bullets
      bullets.forEach((b) => {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        if (b.type === 'emp') {
          ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
        } else if (b.type === 'tractor') {
          ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        } else {
          ctx.rect(b.x - 2.5, b.y - 10, 5, 20);
        }
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Render Enemies
      enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.shadowColor = enemy.glowColor;
        ctx.shadowBlur = 14;

        if (enemy.type === 'spam') {
          // Sleek Red Aggressor Drone
          ctx.fillStyle = '#ff0055';
          ctx.beginPath();
          ctx.moveTo(0, -enemy.radius * 1.1);
          ctx.lineTo(enemy.radius, enemy.radius * 0.85);
          ctx.lineTo(0, enemy.radius * 0.4);
          ctx.lineTo(-enemy.radius, enemy.radius * 0.85);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === 'newsletter') {
          // Purple Cruiser with Pulsing Core
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f3e8ff';
          ctx.beginPath();
          ctx.arc(0, 0, enemy.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (enemy.type === 'receipt') {
          // Golden Cargo Diamond
          ctx.fillStyle = '#ffaa00';
          ctx.beginPath();
          ctx.moveTo(0, -enemy.radius * 1.1);
          ctx.lineTo(enemy.radius, 0);
          ctx.lineTo(0, enemy.radius * 1.1);
          ctx.lineTo(-enemy.radius, 0);
          ctx.closePath();
          ctx.fill();
        }

        // Email Subject Badge
        ctx.shadowBlur = 0;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        const label = enemy.email.subject.slice(0, 16) + '...';
        ctx.fillText(label, 0, enemy.radius + 15);

        ctx.restore();
      });

      // Render Boss Mothership
      if (bossActive) {
        const bossX = canvas.width / 2 + Math.sin(currentTime * 0.002) * (canvas.width * 0.36);
        const bossY = 115;

        ctx.save();
        ctx.translate(bossX, bossY);
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 30;

        // Mothership hull
        ctx.fillStyle = '#881337';
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 80, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pulsing reactor core
        const corePulse = 18 + Math.sin(currentTime * 0.01) * 3;
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-70, -55, 140, 9);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(-70, -55, (bossHp / 2000) * 140, 9);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(-70, -55, 140, 9);

        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fca5a5';
        ctx.textAlign = 'center';
        ctx.fillText(`THE 2021 BACKLOG (${bossHp} UNREAD)`, 0, -62);

        ctx.restore();
      }

      // Render Player Interceptor with Banking Angle
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 18;

      // Outer Energy Shield Pulse
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius * 1.4, 0, Math.PI * 2);
      ctx.stroke();

      // Ship Hull (Cyan Interceptor)
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.moveTo(0, -player.radius * 1.35);
      ctx.lineTo(player.radius, player.radius * 0.95);
      ctx.lineTo(0, player.radius * 0.45);
      ctx.lineTo(-player.radius, player.radius * 0.95);
      ctx.closePath();
      ctx.fill();

      // Cockpit Glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();

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
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [emails, activeWeapon, bossActive, isScreenShakeEnabled]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#06080e] overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair touch-none" />

      {/* Retro HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 font-mono text-xs">
        {/* Left: Mission Stats */}
        <div className="flex items-center gap-3 bg-[#0d111a]/85 border border-cyan-500/40 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-neon-cyan">
          <button
            onClick={onBackToHub}
            className="pointer-events-auto p-1.5 hover:bg-cyan-500/20 text-cyan-400 rounded transition-colors"
            title="Return to Cabinet"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-cyan-400 tracking-wider font-bold">MODULE A // NEBULA PURGE</div>
            <div className="text-sm font-extrabold text-white">SCORE: {stats.score.toLocaleString()}</div>
          </div>
          <div className="h-6 w-px bg-cyan-500/30" />
          <div>
            <div className="text-[10px] text-slate-400">UNREADS VAPORIZED</div>
            <div className="text-sm font-bold text-red-400">{unreadsVaporized}</div>
          </div>
          <div className="h-6 w-px bg-cyan-500/30" />
          <div>
            <div className="text-[10px] text-slate-400">STORAGE FREED</div>
            <div className="text-sm font-bold text-emerald-400">{stats.megabytesFreed} MB</div>
          </div>
        </div>

        {/* Center: Combo Multiplier & Auto-Fire Badge */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {stats.combo > 1 && (
            <div className="bg-gradient-to-r from-cyan-950 to-magenta-950 border border-magenta-500/60 px-4 py-1.5 rounded-full text-magenta-300 font-bold animate-pulse shadow-neon-magenta flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>COMBO x{stats.combo}</span>
            </div>
          )}

          {/* Auto-Fire Toggle Button */}
          <button
            onClick={() => setAutoFire((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-md active:scale-95 ${
              autoFire
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-neon-cyan'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Continuous Auto-Fire [F]"
          >
            <Flame className={`w-3.5 h-3.5 ${autoFire ? 'text-cyan-400 fill-cyan-400' : 'text-slate-500'}`} />
            <span>AUTO-FIRE: {autoFire ? 'ON' : 'OFF'} [F]</span>
          </button>
        </div>

        {/* Right: Reality Desk View & Boss Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {!bossActive && (
            <button
              onClick={() => {
                setBossActive(true);
                setBossHp(2000);
                sound.playExplosion('boss');
              }}
              className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 rounded-lg font-bold transition-all shadow-md active:scale-95 text-[11px] flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>Boss (2021 Backlog)</span>
            </button>
          )}

          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg font-bold transition-all shadow-neon-cyan active:scale-95 text-[11px]"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reality Desk [Tab]</span>
          </button>
        </div>
      </div>

      {/* Bottom Weapon Armory & Action Controls */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#0d111a]/95 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-2xl z-10 font-mono text-xs shadow-2xl">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mr-1">WEAPONS:</span>

        <button
          onClick={() => setActiveWeapon('laser')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeWeapon === 'laser'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold shadow-neon-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
          <span>[1] Laser (Spam)</span>
        </button>

        <button
          onClick={() => setActiveWeapon('emp')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeWeapon === 'emp'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
          <span>[2] EMP (Newsletters)</span>
        </button>

        <button
          onClick={() => setActiveWeapon('tractor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeWeapon === 'tractor'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>[3] Tractor (Receipts)</span>
        </button>

        {/* Clickable Tactile Fire Button for Mouse/Trackpad/Touch */}
        <div className="h-5 w-px bg-slate-700 mx-1" />

        <button
          onMouseDown={() => setIsFiringManual(true)}
          onMouseUp={() => setIsFiringManual(false)}
          onTouchStart={() => setIsFiringManual(true)}
          onTouchEnd={() => setIsFiringManual(false)}
          className={`px-4 py-1.5 rounded-lg font-bold transition-all shadow-md active:scale-95 text-xs flex items-center gap-1.5 ${
            isFiringManual || autoFire
              ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(255,0,85,0.8)]'
              : 'bg-red-950/80 text-red-300 border border-red-500/50 hover:bg-red-900'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>HOLD TO FIRE</span>
        </button>
      </div>

      {/* Control Tooltip Hint */}
      <div className="absolute bottom-5 right-5 text-[10px] text-slate-400 font-mono bg-black/60 px-3 py-1.5 rounded border border-slate-800 pointer-events-none hidden lg:block">
        Glide: [WASD] / [Drag] | Shoot: [Space] / [Click] | Auto-Fire: [F]
      </div>
    </div>
  );
};