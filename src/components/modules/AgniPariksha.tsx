import React, { useRef, useEffect, useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { vedicSound } from '../../lib/audio/VedicSoundEngine';
import { EmailArtifact } from '../../types';
import {
  Shield,
  Zap,
  Sparkles,
  ArrowLeft,
  Eye,
  Crosshair,
  Flame,
  Wind,
  Feather,
  PlusCircle,
  RefreshCw,
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

interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'agni' | 'vayu' | 'pasha';
  color: string;
}

interface MythicCreature {
  id: string;
  email: EmailArtifact;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  type: 'spam_raven' | 'newsletter_locust' | 'carrier_pigeon';
  name: string;
  color: string;
  glowColor: string;
}

export const AgniPariksha: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
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
    isSarathiAutopilotEnabled,
    sarathiSpeed,
    triggerEscalation,
    activeEscalation,
    setMailConnectModalOpen,
    liveAccountEmail,
    isSyncingGmail,
    syncRealGmail,
  } = useTransactionStore();

  const [screenShake, setScreenShake] = useState(0);
  const [activeAstra, setActiveAstra] = useState<'agni' | 'vayu' | 'pasha'>('agni');
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(2000);
  const [unreadsVaporized, setUnreadsVaporized] = useState(0);
  const [autoFire, setAutoFire] = useState(false);
  const [isFiringManual, setIsFiringManual] = useState(false);

  // References for 60fps loop state
  const stateRef = useRef({
    archer: {
      x: 400,
      y: 520,
      targetX: 400,
      targetY: 520,
      vx: 0,
      vy: 0,
      radius: 24,
      speed: 7.2,
      bowAngle: -Math.PI / 2,
    },
    keys: {} as Record<string, boolean>,
    mouse: { x: 400, y: 520, isDown: false },
    touch: { active: false, x: 400, y: 520 },
    arrows: [] as Arrow[],
    creatures: [] as MythicCreature[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    ambientEmbers: [] as { x: number; y: number; speed: number; size: number; alpha: number }[],
    lastShotTime: 0,
    lastSpawnTime: 0,
    activeAstra: 'agni' as 'agni' | 'vayu' | 'pasha',
    autoFire: false,
    isFiringManual: false,
    unreadsVaporized: 0,
  });

  // Sync state refs
  useEffect(() => {
    stateRef.current.activeAstra = activeAstra;
  }, [activeAstra]);

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

    vedicSound.init();

    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        if (stateRef.current.archer.x === 400 && stateRef.current.archer.y === 520) {
          stateRef.current.archer.x = canvas.width / 2;
          stateRef.current.archer.y = canvas.height - 85;
          stateRef.current.archer.targetX = stateRef.current.archer.x;
          stateRef.current.archer.targetY = stateRef.current.archer.y;
        }
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize warm temple ember backdrop
    const embers = [];
    for (let i = 0; i < 90; i++) {
      embers.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 1.8,
        size: 1 + Math.random() * 2.2,
        alpha: 0.15 + Math.random() * 0.65,
      });
    }
    stateRef.current.ambientEmbers = embers;

    // Helper: Add Golden Ember Bursts
    const addEmbers = (x: number, y: number, color: string, count = 18) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 5.2;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 2.8,
          color,
          alpha: 1,
          life: 0,
          maxLife: 22 + Math.random() * 18,
        });
      }
    };

    // Helper: Floating Sanskrit Praise Text
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

    // Spawn Mythic Clutter Creatures
    const spawnCreature = () => {
      const unreadEmails = emails.filter((e) => e.status === 'unread');
      if (unreadEmails.length === 0) return;

      const randomEmail = unreadEmails[Math.floor(Math.random() * unreadEmails.length)];
      const x = 50 + Math.random() * (canvas.width - 100);
      const y = -30;

      let type: 'spam_raven' | 'newsletter_locust' | 'carrier_pigeon' = 'spam_raven';
      let name = 'काकासुर (Spam Raven)';
      let color = '#dc2626'; // Sacred Vermilion / Fire
      let glowColor = 'rgba(220, 38, 38, 0.65)';
      let maxHp = 1;

      if (randomEmail.type === 'newsletter') {
        type = 'newsletter_locust';
        name = 'शलभ (Newsletter Locust)';
        color = '#a855f7'; // Purple
        glowColor = 'rgba(168, 85, 247, 0.65)';
        maxHp = 2;
      } else if (randomEmail.type === 'receipt') {
        type = 'carrier_pigeon';
        name = 'स्वर्ण कपोत (Invoice Pigeon)';
        color = '#d97706'; // Antique Temple Gold
        glowColor = 'rgba(217, 119, 6, 0.65)';
        maxHp = 1;
      }

      stateRef.current.creatures.push({
        id: randomEmail.id,
        email: randomEmail,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.1 + Math.random() * 1.4,
        radius: type === 'newsletter_locust' ? 22 : type === 'carrier_pigeon' ? 19 : 17,
        hp: maxHp,
        maxHp,
        type,
        name,
        color,
        glowColor,
      });
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === '1') setActiveAstra('agni');
      if (e.key === '2') setActiveAstra('vayu');
      if (e.key === '3') setActiveAstra('pasha');
      if (e.key === 'f' || e.key === 'F') setAutoFire((prev) => !prev);
      if (e.key === 'b' || e.key === 'B') {
        setBossActive(true);
        setBossHp(2000);
        vedicSound.playShankhaBlast();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    // Mouse controls
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      stateRef.current.mouse.x = mx;
      stateRef.current.mouse.y = my;

      if (stateRef.current.mouse.isDown) {
        stateRef.current.archer.targetX = mx;
        stateRef.current.archer.targetY = my;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.mouse.isDown = true;
        const rect = canvas.getBoundingClientRect();
        stateRef.current.archer.targetX = e.clientX - rect.left;
        stateRef.current.archer.targetY = e.clientY - rect.top;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) stateRef.current.mouse.isDown = false;
    };

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const tx = e.touches[0].clientX - rect.left;
        const ty = e.touches[0].clientY - rect.top;
        stateRef.current.touch.active = true;
        stateRef.current.touch.x = tx;
        stateRef.current.touch.y = ty;
        stateRef.current.archer.targetX = tx;
        stateRef.current.archer.targetY = ty;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const tx = e.touches[0].clientX - rect.left;
        const ty = e.touches[0].clientY - rect.top;
        stateRef.current.touch.x = tx;
        stateRef.current.touch.y = ty;
        stateRef.current.archer.targetX = tx;
        stateRef.current.archer.targetY = ty;
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
    // 60 FPS FLUID ARCHERY TRIAL LOOP
    // ==========================================
    let animationId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const {
        archer,
        keys,
        mouse,
        touch,
        arrows,
        creatures,
        particles,
        floatingTexts,
        ambientEmbers,
      } = state;

      // 1. Smooth Archer Movement & Lerp (With Sarathi AI Autopilot)
      let moveDirX = 0;
      let moveDirY = 0;

      // Time Dilation when an Escalation is awaiting human wisdom
      const timeScale = activeEscalation ? 0.12 : 1.0;

      if (isSarathiAutopilotEnabled && creatures.length > 0) {
        // Sarathi Divine Charioteer auto-targets the nearest unread creature
        const validTargets = creatures.filter((c) => !c.email.isVip);
        const target = validTargets[0] || creatures[0];

        if (target) {
          archer.targetX = target.x;
          archer.bowAngle = Math.atan2(target.y - archer.y, target.x - archer.x);

          // Ambiguity Check: trigger human-in-the-loop escalation
          if (
            target.type === 'carrier_pigeon' &&
            target.email.sizeKb > 140 &&
            !activeEscalation &&
            Math.random() < 0.004
          ) {
            triggerEscalation({
              id: `esc-email-${target.id}`,
              title: 'संदिग्ध देय पत्र // Ambiguous Corporate Invoice',
              description: `Invoice from "${target.email.sender}" (${target.email.subject}) requires conscious tax classification.`,
              riskLevel: 'medium',
              aiConfidence: 0.68,
              reason: 'Unmatched vendor taxonomy in Dharmic ledger. Confirm if business tax-deductible or personal.',
              targetArtifact: target.email,
              moduleId: 'agni-pariksha',
              suggestedActionLabel: 'Archive to Tax Treasury',
              options: [
                {
                  id: 'opt-receipt',
                  label: 'स्वर्ण कोष (File to Tax Treasury)',
                  description: 'Approve as genuine business expense and file invoice.',
                  isRecommended: true,
                  actionType: 'approve',
                },
                {
                  id: 'opt-trash',
                  label: 'यमलोक संचय (Banish to Yamaloka Vault)',
                  description: 'Stage in 30-day quarantine for review.',
                  actionType: 'quarantine',
                },
                {
                  id: 'opt-archive',
                  label: 'वायव्य विसर्जन (Unsubscribe & Mute)',
                  description: 'Archive and sever email subscription.',
                  actionType: 'reject',
                },
              ],
            });
          }
        }
      }

      if (keys['a'] || keys['arrowleft']) moveDirX -= 1;
      if (keys['d'] || keys['arrowright']) moveDirX += 1;
      if (keys['w'] || keys['arrowup']) moveDirY -= 1;
      if (keys['s'] || keys['arrowdown']) moveDirY += 1;

      if (moveDirX !== 0 || moveDirY !== 0) {
        const len = Math.hypot(moveDirX, moveDirY) || 1;
        const targetVx = (moveDirX / len) * archer.speed * timeScale;
        const targetVy = (moveDirY / len) * archer.speed * timeScale;

        archer.vx += (targetVx - archer.vx) * 0.22;
        archer.vy += (targetVy - archer.vy) * 0.22;
        archer.x += archer.vx;
        archer.y += archer.vy;
        archer.targetX = archer.x;
        archer.targetY = archer.y;
      } else if (isSarathiAutopilotEnabled || mouse.isDown || touch.active) {
        const dx = archer.targetX - archer.x;
        const dy = archer.targetY - archer.y;
        archer.vx = dx * 0.18 * (isSarathiAutopilotEnabled ? sarathiSpeed : 1) * timeScale;
        archer.vy = dy * 0.18 * (isSarathiAutopilotEnabled ? sarathiSpeed : 1) * timeScale;
        archer.x += archer.vx;
        archer.y += archer.vy;
      } else {
        archer.vx *= 0.88;
        archer.vy *= 0.88;
        archer.x += archer.vx;
        archer.y += archer.vy;
      }

      // Constrain inside arena
      archer.x = Math.max(archer.radius + 15, Math.min(canvas.width - archer.radius - 15, archer.x));
      archer.y = Math.max(archer.radius + 15, Math.min(canvas.height - archer.radius - 15, archer.y));

      // 2. Archery Astra Firing
      const shouldShoot =
        isSarathiAutopilotEnabled ||
        state.autoFire ||
        keys[' '] ||
        mouse.isDown ||
        touch.active ||
        state.isFiringManual;

      const baseInterval =
        state.activeAstra === 'vayu' ? 230 : state.activeAstra === 'pasha' ? 180 : 110;
      const shootInterval = isSarathiAutopilotEnabled
        ? Math.max(40, baseInterval / (sarathiSpeed * 1.4))
        : baseInterval;

      if (shouldShoot && currentTime - state.lastShotTime > shootInterval) {
        state.lastShotTime = currentTime;

        vedicSound.playAgneyastraArrow();

        if (state.activeAstra === 'agni') {
          // Twin fiery Agneyastra arrows
          arrows.push({
            x: archer.x - 12,
            y: archer.y - 18,
            vx: archer.vx * 0.1,
            vy: -16,
            type: 'agni',
            color: '#f59e0b',
          });
          arrows.push({
            x: archer.x + 12,
            y: archer.y - 18,
            vx: archer.vx * 0.1,
            vy: -16,
            type: 'agni',
            color: '#f59e0b',
          });
        } else if (state.activeAstra === 'vayu') {
          // 3-way Vayavyastra spread
          [-3.6, 0, 3.6].forEach((spreadVx) => {
            arrows.push({
              x: archer.x,
              y: archer.y - 20,
              vx: spreadVx,
              vy: -12,
              type: 'vayu',
              color: '#38bdf8',
            });
          });
        } else if (state.activeAstra === 'pasha') {
          // Varunapasha Silk Net
          arrows.push({
            x: archer.x,
            y: archer.y - 20,
            vx: 0,
            vy: -13,
            type: 'pasha',
            color: '#fbbf24',
          });
        }
      }

      // 3. Regular Creature Spawns
      if (currentTime - state.lastSpawnTime > 680) {
        state.lastSpawnTime = currentTime;
        spawnCreature();
      }

      // 4. Update Arrows
      for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i];
        a.x += a.vx;
        a.y += a.vy;

        if (a.y < -30 || a.x < -30 || a.x > canvas.width + 30) {
          arrows.splice(i, 1);
        }
      }

      // 5. Update Creatures & Hit Collision
      for (let i = creatures.length - 1; i >= 0; i--) {
        const c = creatures[i];
        c.x += c.vx;
        c.y += c.vy;

        if (c.x < c.radius || c.x > canvas.width - c.radius) {
          c.vx *= -1;
        }

        // Arrow Collisions
        for (let j = arrows.length - 1; j >= 0; j--) {
          const arrow = arrows[j];
          const dist = Math.hypot(c.x - arrow.x, c.y - arrow.y);

          if (dist < c.radius + 8) {
            arrows.splice(j, 1);

            // Golden Kavacha VIP Protection: Celestial Shield Deflection
            if (c.email.isVip || c.email.kavachaActive) {
              addEmbers(arrow.x, arrow.y, '#fbbf24', 16);
              vedicSound.playTempleBell(2.2, 2.5);
              addFloatingText(c.x, c.y - 12, '🛡️ कवचम् सुरक्षितम्! (VIP Shield Active)', '#fbbf24');
              continue;
            }

            c.hp -= 1;
            addEmbers(arrow.x, arrow.y, arrow.color, 8);

            if (c.hp <= 0) {
              creatures.splice(i, 1);
              addEmbers(c.x, c.y, c.color, 28);
              vedicSound.playMridangam('chaapu');
              vedicSound.playPunyaChime();
              setScreenShake(isScreenShakeEnabled ? 7 : 0);

              // Background Physical Chore Execution
              if (c.type === 'spam_raven') {
                trashEmail(c.id);
                addFloatingText(c.x, c.y, `भस्मम्! (-${c.email.sizeKb}KB)`, '#dc2626');
              } else if (c.type === 'newsletter_locust') {
                unsubscribeEmail(c.id);
                addFloatingText(c.x, c.y, 'वायव्य विसर्जन (Unsubscribed)', '#38bdf8');
              } else if (c.type === 'carrier_pigeon') {
                archiveReceiptEmail(c.id);
                addFloatingText(c.x, c.y, 'स्वर्ण कोष (Tax Receipt Filed)', '#d97706');
              }

              state.unreadsVaporized += 1;
              setUnreadsVaporized(state.unreadsVaporized);
              addScore(180);
              incrementCombo();
              break;
            }
          }
        }

        if (c.y > canvas.height + 40) {
          creatures.splice(i, 1);
          resetCombo();
        }
      }

      // 6. Boss Kumbhakarna's Backlog
      if (bossActive) {
        const bossX = canvas.width / 2 + Math.sin(currentTime * 0.002) * (canvas.width * 0.35);
        const bossY = 120;

        for (let j = arrows.length - 1; j >= 0; j--) {
          const arrow = arrows[j];
          const dist = Math.hypot(bossX - arrow.x, bossY - arrow.y);

          if (dist < 75) {
            arrows.splice(j, 1);
            addEmbers(arrow.x, arrow.y, '#f59e0b', 9);
            vedicSound.playMridangam('dheem');

            setBossHp((prev) => {
              const next = Math.max(0, prev - 25);
              if (next % 200 === 0 && next > 0) {
                bulkNukeEmails(25);
                vedicSound.playBrahmastraPurge();
                setScreenShake(isScreenShakeEnabled ? 15 : 0);
                addFloatingText(bossX, bossY + 45, '⚡ ब्रह्मास्त्र प्रहार (25 Emails Vaporized)', '#fbbf24');
              }
              if (next <= 0) {
                setBossActive(false);
                vedicSound.playBansuriFanfare();
                vedicSound.playTempleBell(0.8, 4.0);
                setScreenShake(isScreenShakeEnabled ? 22 : 0);
                bulkNukeEmails(100);
                addFloatingText(bossX, bossY, '🏆 कुम्भकर्ण निद्रा भंग! +5,000 Punya', '#f59e0b');
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
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      // 8. Update Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.015;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // 9. Update Ambient Embers
      ambientEmbers.forEach((e) => {
        e.y -= e.speed;
        if (e.y < 0) {
          e.y = canvas.height;
          e.x = Math.random() * canvas.width;
        }
      });

      // 10. RENDER CANVAS SCENE
      ctx.save();

      // Screen Shake
      if (screenShake > 0 && isScreenShakeEnabled) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
        setScreenShake((prev) => Math.max(0, prev - 0.5));
      }

      // Sacred Temple Night Sky Backdrop
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ambient Embers
      ambientEmbers.forEach((e) => {
        ctx.fillStyle = `rgba(245, 158, 11, ${e.alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Arrows
      arrows.forEach((a) => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.shadowColor = a.color;
        ctx.shadowBlur = 12;

        if (a.type === 'agni') {
          // Fiery Arrow with Golden Tip
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 14);
          ctx.lineTo(0, -14);
          ctx.stroke();

          // Flaming arrowhead
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(0, -18);
          ctx.lineTo(4, -10);
          ctx.lineTo(-4, -10);
          ctx.closePath();
          ctx.fill();
        } else if (a.type === 'vayu') {
          // Swirling Wind Arrow
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Varunapasha Silk Lasso Net
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, 8, 14, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Render Creatures
      creatures.forEach((c) => {
        ctx.save();
        ctx.translate(c.x, c.y);

        // Golden Kavacha Halo for Protected VIP Targets
        if (c.email.isVip || c.email.kavachaActive) {
          ctx.save();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 12;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, c.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.shadowColor = c.glowColor;
        ctx.shadowBlur = 14;

        if (c.type === 'spam_raven') {
          // Kakasura Raven with Red Beak & Shadow Wings
          ctx.fillStyle = '#1c1917';
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, c.radius, c.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Beak
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(0, c.radius * 0.7);
          ctx.lineTo(4, c.radius * 1.3);
          ctx.lineTo(-4, c.radius * 1.3);
          ctx.closePath();
          ctx.fill();
        } else if (c.type === 'newsletter_locust') {
          // Shalabha Locust with Iridescent Wings
          ctx.fillStyle = '#6b21a8';
          ctx.beginPath();
          ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(0, 0, c.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (c.type === 'carrier_pigeon') {
          // Golden Carrier Pigeon with Invoice Scroll
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.moveTo(0, -c.radius * 1.1);
          ctx.lineTo(c.radius, 0);
          ctx.lineTo(0, c.radius * 1.1);
          ctx.lineTo(-c.radius, 0);
          ctx.closePath();
          ctx.fill();
        }

        // Email Subject Label Badge
        ctx.shadowBlur = 0;
        ctx.font = '10px "Noto Serif Devanagari", serif';
        ctx.fillStyle = '#ede5d5';
        ctx.textAlign = 'center';
        const label = c.email.subject.slice(0, 16) + '...';
        ctx.fillText(label, 0, c.radius + 15);

        ctx.restore();
      });

      // Render Boss: कुम्भकर्ण महादूत (Kumbhakarna's Backlog)
      if (bossActive) {
        const bossX = canvas.width / 2 + Math.sin(currentTime * 0.002) * (canvas.width * 0.35);
        const bossY = 120;

        ctx.save();
        ctx.translate(bossX, bossY);
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 32;

        // Giant Titan Torso
        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 85, 42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pulsing Heart of Procrastination
        const pulse = 18 + Math.sin(currentTime * 0.01) * 4;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, pulse, 0, Math.PI * 2);
        ctx.fill();

        // Boss Health Bar
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-75, -58, 150, 10);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-75, -58, (bossHp / 2000) * 150, 10);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-75, -58, 150, 10);

        ctx.font = 'bold 11px "Yatra One", serif';
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'center';
        ctx.fillText(`कुम्भकर्ण महादूत // 2,000 UNREAD EMAILS (${bossHp} HP)`, 0, -66);

        ctx.restore();
      }

      // Render Archer with Sacred Dhanush (Bow)
      ctx.save();
      ctx.translate(archer.x, archer.y);
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 18;

      // Golden Bow Arc
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, archer.radius * 1.3, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // Brahmic String
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-archer.radius * 1.1, -archer.radius * 0.7);
      ctx.lineTo(0, archer.radius * 0.4);
      ctx.lineTo(archer.radius * 1.1, -archer.radius * 0.7);
      ctx.stroke();

      // Archer Core Diya Glow
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, -4, 6, 0, Math.PI * 2);
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

      // Render Floating Praise Texts
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
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [emails, activeAstra, bossActive, isScreenShakeEnabled]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0a0d16] overflow-hidden select-none font-sans text-[#ede5d5]">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair touch-none" />

      {/* Vedic Top HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 text-xs">
        {/* Left: Mission Lore Stats */}
        <div className="flex items-center gap-3 bg-[#131622]/90 border border-vedic-gold/50 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-vedic-gold">
          <button
            onClick={onBackToHub}
            className="pointer-events-auto p-1.5 hover:bg-vedic-gold/20 text-vedic-gold-bright rounded-xl transition-colors"
            title="Return to Mandapa Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-vedic-gold tracking-widest font-devanagari font-bold">
              अध्याय १ // अग्नि परीक्षा (AGNI PARIKSHA)
            </div>
            <div className="text-sm font-extrabold text-white">
              पुण्य: {stats.karmaPoints.toLocaleString()}
            </div>
          </div>
          <div className="h-6 w-px bg-vedic-gold/30" />
          <div>
            <div className="text-[10px] text-[#cbbda3]">क्लेश भस्म</div>
            <div className="text-sm font-bold text-red-400">{unreadsVaporized}</div>
          </div>
          <div className="h-6 w-px bg-vedic-gold/30" />
          <div>
            <div className="text-[10px] text-[#cbbda3]">शुद्धीकृत डेटा</div>
            <div className="text-sm font-bold text-emerald-400">{stats.megabytesPurified} MB</div>
          </div>
        </div>

        {/* Center: Tapasya Combo Streak & Auto-Fire */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {stats.combo > 1 && (
            <div className="bg-gradient-to-r from-terracotta-deep to-vedic-gold border border-vedic-gold px-4 py-1.5 rounded-full text-white font-devanagari font-bold animate-pulse shadow-vedic-gold flex items-center gap-2">
              <Zap className="w-4 h-4 text-vedic-gold-bright fill-vedic-gold-bright" />
              <span>तपस्या x{stats.combo} ({stats.tapasyaMultiplier}x Bonus)</span>
            </div>
          )}

          {/* Auto-Fire Toggle */}
          <button
            onClick={() => setAutoFire((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-md active:scale-95 ${
              autoFire
                ? 'bg-vedic-gold/30 text-vedic-gold-bright border-vedic-gold shadow-vedic-gold'
                : 'bg-[#181b26]/90 text-[#cbbda3] border-[#373c52] hover:text-white'
            }`}
            title="Toggle Continuous Sacred Auto-Fire [F]"
          >
            <Flame className={`w-3.5 h-3.5 ${autoFire ? 'text-vedic-gold-bright fill-vedic-gold-bright' : 'text-slate-500'}`} />
            <span>सतत शरवर्षा: {autoFire ? 'चालू' : 'बंद'} [F]</span>
          </button>
        </div>

        {/* Right: Add Mail, Sync Gmail, Boss Summon & Reality View */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Simple Add Mail Button */}
          <button
            onClick={() => setMailConnectModalOpen(true)}
            className="px-3 py-2 bg-gradient-to-r from-amber-600/30 to-vedic-gold/25 hover:from-amber-600/50 hover:to-vedic-gold/40 border border-vedic-gold text-vedic-gold-bright rounded-xl font-bold transition-all shadow-md active:scale-95 text-[11px] flex items-center gap-1.5"
            title="Add real emails to vaporize"
          >
            <PlusCircle className="w-3.5 h-3.5 text-vedic-gold-bright" />
            <span>+ पत्र जोड़ें (Add Mail)</span>
          </button>

          {/* Sync Real Gmail Button */}
          <button
            onClick={() => {
              if (liveAccountEmail) {
                syncRealGmail();
              } else {
                setMailConnectModalOpen(true);
              }
            }}
            className="px-3 py-2 bg-[#181b26]/90 hover:bg-vedic-gold/20 border border-vedic-gold/40 text-vedic-gold-bright rounded-xl font-bold transition-all shadow-md active:scale-95 text-[11px] flex items-center gap-1.5"
            title={liveAccountEmail ? 'Sync latest unread inbox' : 'Authenticate with Google'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin' : ''}`} />
            <span>{liveAccountEmail ? 'जीमेल सिंक' : 'Sync Real Gmail'}</span>
          </button>

          {!bossActive && (
            <button
              onClick={() => {
                setBossActive(true);
                setBossHp(2000);
                vedicSound.playShankhaBlast();
              }}
              className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 rounded-xl font-bold transition-all shadow-md active:scale-95 text-[11px] flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>कुम्भकर्ण आह्वान (Boss)</span>
            </button>
          )}

          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-terracotta-deep to-[#7c2d12] hover:from-[#9a3412] hover:to-terracotta-deep border border-vedic-gold/60 text-vedic-gold-bright rounded-xl font-bold transition-all shadow-vedic-gold active:scale-95 text-[11px]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>प्रत्यक्ष दर्शन [Tab]</span>
          </button>
        </div>
      </div>

      {/* Bottom Astra Armory Selector */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-[#121522]/95 border border-vedic-gold/50 backdrop-blur-md px-4 py-2 rounded-2xl z-10 font-devanagari text-xs shadow-2xl">
        <span className="text-[11px] text-[#cbbda3] uppercase font-bold tracking-wider mr-1">अस्त्र चयन:</span>

        {/* Agneyastra */}
        <button
          onClick={() => setActiveAstra('agni')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeAstra === 'agni'
              ? 'bg-vedic-gold/25 text-vedic-gold-bright border border-vedic-gold font-bold shadow-vedic-gold'
              : 'text-[#cbbda3] hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-vedic-gold-bright" />
          <span>[1] आग्नेयास्त्र (Spam Raven)</span>
        </button>

        {/* Vayavyastra */}
        <button
          onClick={() => setActiveAstra('vayu')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeAstra === 'vayu'
              ? 'bg-sky-500/25 text-sky-300 border border-sky-400 font-bold shadow-md'
              : 'text-[#cbbda3] hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Wind className="w-3.5 h-3.5 text-sky-400" />
          <span>[2] वायव्यास्त्र (Newsletter)</span>
        </button>

        {/* Varunapasha */}
        <button
          onClick={() => setActiveAstra('pasha')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeAstra === 'pasha'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400 font-bold shadow-md'
              : 'text-[#cbbda3] hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Feather className="w-3.5 h-3.5 text-amber-400" />
          <span>[3] वरुणपाश (Invoice Pigeon)</span>
        </button>

        {/* Hold to Fire Action */}
        <div className="h-5 w-px bg-vedic-gold/30 mx-1" />

        <button
          onMouseDown={() => setIsFiringManual(true)}
          onMouseUp={() => setIsFiringManual(false)}
          onTouchStart={() => setIsFiringManual(true)}
          onTouchEnd={() => setIsFiringManual(false)}
          className={`px-4 py-1.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs flex items-center gap-1.5 ${
            isFiringManual || autoFire
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.8)]'
              : 'bg-red-950/80 text-red-300 border border-red-500/50 hover:bg-red-900'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>शरवर्षा (FIRE)</span>
        </button>
      </div>

      {/* Control Tooltip Hint */}
      <div className="absolute bottom-5 right-5 text-[10px] text-[#cbbda3] font-serif bg-black/60 px-3 py-1.5 rounded border border-[#373c52] pointer-events-none hidden lg:block">
        Aim: [WASD] / [Drag] | Shoot: [Space] / [Click] | Astras: [1][2][3]
      </div>
    </div>
  );
};
