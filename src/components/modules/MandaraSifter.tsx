import React, { useRef, useEffect, useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { vedicSound } from '../../lib/audio/VedicSoundEngine';
import { FileArtifact } from '../../types';
import {
  ArrowLeft,
  Eye,
  Zap,
  Wind,
  ArrowUpCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

type ShapeType = 'scroll' | 'plate';

interface PhysicsBody {
  id: string;
  file: FileArtifact;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  shape: ShapeType;
  radius: number;
  width: number;
  height: number;
  mass: number;
  restitution: number;
  friction: number;
  color: string;
  glowColor: string;
  category: 'screenshot' | 'pdf' | 'installer' | 'archive' | 'messy_temp';
  label: string;
  isBeingDragged: boolean;
  suctionProgress: number;
  isSuctioned: boolean;
  bounces: number;
}

interface SacredPortal {
  id: string;
  nameDevanagari: string;
  nameEnglish: string;
  destination: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'pdf' | 'screenshot' | 'compress' | 'trash';
  pulsePhase: number;
}

interface LotusBumper {
  x: number;
  y: number;
  radius: number;
  color: string;
  flashLife: number;
  points: number;
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
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

export const MandaraSifter: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    files,
    moveFile,
    deleteFile,
    compressFile,
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

  const [vayuWindActive, setVayuWindActive] = useState(false);
  const [invertedCurrent, setInvertedCurrent] = useState(false);
  const [organizedCount, setOrganizedCount] = useState(0);
  const [mergesCount, setMergesCount] = useState(0);

  const stateRef = useRef({
    files: [] as PhysicsBody[],
    portals: [] as SacredPortal[],
    bumpers: [] as LotusBumper[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    draggedBody: null as PhysicsBody | null,
    dragAnchor: { x: 0, y: 0 },
    dragCurrent: { x: 0, y: 0 },
    mouse: { x: 0, y: 0, isDown: false, isRightDown: false },
    gravity: 0.32,
    vayuWindActive: false,
    invertedCurrent: false,
    nextDropTime: 0,
    screenShake: 0,
    suikaMergedIds: new Set<string>(),
  });

  useEffect(() => {
    stateRef.current.vayuWindActive = vayuWindActive;
  }, [vayuWindActive]);

  useEffect(() => {
    stateRef.current.invertedCurrent = invertedCurrent;
    stateRef.current.gravity = invertedCurrent ? -0.28 : 0.32;
  }, [invertedCurrent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    vedicSound.init();

    const setupLayout = () => {
      if (!containerRef.current || !canvas) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;

      const w = canvas.width;
      const h = canvas.height;

      // 4 Sacred Portals (Sanctums) at the bottom
      stateRef.current.portals = [
        {
          id: 'portal-docs',
          nameDevanagari: 'ग्रन्थागार (Documents)',
          nameEnglish: '/Documents/Archive',
          destination: '/Documents/Archive/2026',
          x: w * 0.16,
          y: h - 75,
          radius: 54,
          color: '#38bdf8', // Blue
          type: 'pdf',
          pulsePhase: 0,
        },
        {
          id: 'portal-pics',
          nameDevanagari: 'चित्रवन (Pictures)',
          nameEnglish: '/Pictures/Screenshots',
          destination: '/Pictures/Screenshots',
          x: w * 0.38,
          y: h - 75,
          radius: 54,
          color: '#22c55e', // Green
          type: 'screenshot',
          pulsePhase: Math.PI * 0.5,
        },
        {
          id: 'portal-zip',
          nameDevanagari: 'संग्रह शिला (.ZIP)',
          nameEnglish: '/Archives/Batch',
          destination: '/Archives',
          x: w * 0.62,
          y: h - 75,
          radius: 54,
          color: '#fbbf24', // Gold
          type: 'compress',
          pulsePhase: Math.PI,
        },
        {
          id: 'portal-trash',
          nameDevanagari: 'हवन कुण्ड (Trash Pyre)',
          nameEnglish: '~/.Trash (Delete)',
          destination: '~/.Trash',
          x: w * 0.84,
          y: h - 75,
          radius: 54,
          color: '#ef4444', // Agni Fire Red
          type: 'trash',
          pulsePhase: Math.PI * 1.5,
        },
      ];

      // Lotus Bumper Obstacles
      stateRef.current.bumpers = [
        { x: w * 0.28, y: h * 0.38, radius: 28, color: '#38bdf8', flashLife: 0, points: 50 },
        { x: w * 0.50, y: h * 0.26, radius: 32, color: '#f59e0b', flashLife: 0, points: 100 },
        { x: w * 0.72, y: h * 0.38, radius: 28, color: '#22c55e', flashLife: 0, points: 50 },
      ];
    };

    setupLayout();
    window.addEventListener('resize', setupLayout);

    // Initial pool of physical files
    const unorganized = files.filter((f) => f.status === 'in_downloads');
    const initialPool = unorganized.slice(0, 15);

    const createBody = (f: FileArtifact, x: number, y: number, vx = 0, vy = 0): PhysicsBody => {
      const isPlate = f.category === 'pdf' || f.category === 'installer' || f.category === 'archive';
      const radius = f.category === 'installer' ? 32 : f.category === 'pdf' ? 26 : f.category === 'screenshot' ? 24 : 20;
      const width = radius * 2.1;
      const height = radius * 1.5;

      const colorMap = {
        pdf: '#38bdf8',
        screenshot: '#22c55e',
        archive: '#fbbf24',
        installer: '#f97316',
        messy_temp: '#ef4444',
      };

      const glowMap = {
        pdf: 'rgba(56, 189, 248, 0.45)',
        screenshot: 'rgba(34, 197, 94, 0.45)',
        archive: 'rgba(251, 191, 36, 0.45)',
        installer: 'rgba(249, 115, 22, 0.45)',
        messy_temp: 'rgba(239, 68, 68, 0.45)',
      };

      const labelMap = {
        pdf: 'ग्रन्थ (Doc)',
        screenshot: 'चित्र (Shot)',
        archive: 'कोष (Zip)',
        installer: 'शिला (App)',
        messy_temp: 'कचरा (Temp)',
      };

      return {
        id: f.id,
        file: f,
        x,
        y,
        vx,
        vy,
        angle: (Math.random() - 0.5) * 0.5,
        vAngle: (Math.random() - 0.5) * 0.05,
        shape: isPlate ? 'plate' : 'scroll',
        radius,
        width,
        height,
        mass: isPlate ? (width * height) / 350 : (Math.PI * radius * radius) / 400,
        restitution: 0.68,
        friction: 0.985,
        color: colorMap[f.category] || '#38bdf8',
        glowColor: glowMap[f.category] || 'rgba(56, 189, 248, 0.4)',
        category: f.category,
        label: labelMap[f.category] || 'फाइल',
        isBeingDragged: false,
        suctionProgress: 0,
        isSuctioned: false,
        bounces: 0,
      };
    };

    stateRef.current.files = initialPool.map((f, i) => {
      const x = 120 + (i % 5) * 130 + (Math.random() - 0.5) * 40;
      const y = 60 + Math.floor(i / 5) * 75;
      return createBody(f, x, y, (Math.random() - 0.5) * 2, Math.random() * 2);
    });

    const addParticles = (x: number, y: number, color: string, count = 16) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 2.5,
          color,
          alpha: 1,
          life: 0,
          maxLife: 25 + Math.random() * 15,
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
        vy: -1.4,
        scale: 1,
      });
    };

    // Slingshot / Drag Controls
    const getCanvasPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const pos = getCanvasPos(e);
      stateRef.current.mouse.x = pos.x;
      stateRef.current.mouse.y = pos.y;

      if (e.button === 2) {
        e.preventDefault();
        stateRef.current.mouse.isRightDown = true;
        vedicSound.playMridangam('dheem');
        return;
      }

      if (e.button === 0) {
        stateRef.current.mouse.isDown = true;
        const pFiles = stateRef.current.files;

        for (let i = pFiles.length - 1; i >= 0; i--) {
          const body = pFiles[i];
          const dist = Math.hypot(pos.x - body.x, pos.y - body.y);
          const hitRadius = body.shape === 'plate' ? Math.max(body.width, body.height) * 0.6 : body.radius + 6;

          if (dist <= hitRadius && !body.isSuctioned) {
            body.isBeingDragged = true;
            body.vx = 0;
            body.vy = 0;
            stateRef.current.draggedBody = body;
            stateRef.current.dragAnchor = { x: body.x, y: body.y };
            stateRef.current.dragCurrent = { x: pos.x, y: pos.y };
            vedicSound.playMridangam('ta');
            break;
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const pos = getCanvasPos(e);
      stateRef.current.mouse.x = pos.x;
      stateRef.current.mouse.y = pos.y;

      if (stateRef.current.draggedBody) {
        stateRef.current.dragCurrent = { x: pos.x, y: pos.y };
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        stateRef.current.mouse.isRightDown = false;
        return;
      }

      if (e.button === 0) {
        const dragged = stateRef.current.draggedBody;
        if (dragged) {
          const anchor = stateRef.current.dragAnchor;
          const current = stateRef.current.dragCurrent;
          const dx = anchor.x - current.x;
          const dy = anchor.y - current.y;
          const pullDist = Math.hypot(dx, dy);

          if (pullDist > 14) {
            const power = Math.min(pullDist * 0.18, 22);
            dragged.vx = (dx / pullDist) * power;
            dragged.vy = (dy / pullDist) * power;
            dragged.vAngle = (Math.random() - 0.5) * 0.25;
            vedicSound.playMridangam('chaapu');
            addParticles(dragged.x, dragged.y, dragged.color, 14);
          }

          dragged.isBeingDragged = false;
          stateRef.current.draggedBody = null;
        }
        stateRef.current.mouse.isDown = false;
      }
    };

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const pos = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
      stateRef.current.mouse.x = pos.x;
      stateRef.current.mouse.y = pos.y;
      stateRef.current.mouse.isDown = true;

      const pFiles = stateRef.current.files;
      for (let i = pFiles.length - 1; i >= 0; i--) {
        const body = pFiles[i];
        const dist = Math.hypot(pos.x - body.x, pos.y - body.y);
        const hitRadius = body.shape === 'plate' ? Math.max(body.width, body.height) * 0.7 : body.radius + 12;

        if (dist <= hitRadius && !body.isSuctioned) {
          body.isBeingDragged = true;
          body.vx = 0;
          body.vy = 0;
          stateRef.current.draggedBody = body;
          stateRef.current.dragAnchor = { x: body.x, y: body.y };
          stateRef.current.dragCurrent = { x: pos.x, y: pos.y };
          vedicSound.playMridangam('ta');
          break;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const pos = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
      stateRef.current.mouse.x = pos.x;
      stateRef.current.mouse.y = pos.y;

      if (stateRef.current.draggedBody) {
        stateRef.current.dragCurrent = { x: pos.x, y: pos.y };
      }
    };

    const handleTouchEnd = () => {
      const dragged = stateRef.current.draggedBody;
      if (dragged) {
        const anchor = stateRef.current.dragAnchor;
        const current = stateRef.current.dragCurrent;
        const dx = anchor.x - current.x;
        const dy = anchor.y - current.y;
        const pullDist = Math.hypot(dx, dy);

        if (pullDist > 14) {
          const power = Math.min(pullDist * 0.18, 22);
          dragged.vx = (dx / pullDist) * power;
          dragged.vy = (dy / pullDist) * power;
          dragged.vAngle = (Math.random() - 0.5) * 0.25;
          vedicSound.playMridangam('chaapu');
          addParticles(dragged.x, dragged.y, dragged.color, 14);
        }

        dragged.isBeingDragged = false;
        stateRef.current.draggedBody = null;
      }
      stateRef.current.mouse.isDown = false;
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setVayuWindActive((prev) => !prev);
        vedicSound.playMridangam('dheem');
      }
      if (e.key === 'g' || e.key === 'G') {
        setInvertedCurrent((prev) => !prev);
        vedicSound.playPortalSuction();
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // ==========================================
    // 60 FPS SAMUDRA MANTHAN PHYSICS ENGINE
    // ==========================================
    let animationId: number;
    let vortexAngle = 0;

    const loop = (currentTime: number) => {
      vortexAngle += 0.025;
      const state = stateRef.current;
      const {
        files: pFiles,
        portals,
        bumpers,
        particles,
        floatingTexts,
        gravity,
        vayuWindActive: isWind,
        mouse,
      } = state;

      // 1. Drop Continuous Clutter Downloads
      if (pFiles.length < 14 && currentTime > state.nextDropTime) {
        state.nextDropTime = currentTime + 1600;
        const remainingUnorganized = files.filter(
          (f) => f.status === 'in_downloads' && !pFiles.some((pf) => pf.id === f.id)
        );
        if (remainingUnorganized.length > 0) {
          const newF = remainingUnorganized[Math.floor(Math.random() * remainingUnorganized.length)];
          const spawnX = 80 + Math.random() * (canvas.width - 160);
          pFiles.push(createBody(newF, spawnX, -30, (Math.random() - 0.5) * 3, 2 + Math.random() * 2));
        }
      }

      // 2. Update Lotus Bumpers
      bumpers.forEach((b) => {
        if (b.flashLife > 0) b.flashLife -= 0.05;
      });

      // 3. Update Physics Bodies
      for (let i = pFiles.length - 1; i >= 0; i--) {
        const body = pFiles[i];

        // Suction into Sacred Portals
        if (body.isSuctioned) {
          body.suctionProgress += 0.05;
          body.vx *= 0.85;
          body.vy *= 0.85;
          body.x += body.vx;
          body.y += body.vy;

          if (body.suctionProgress >= 1) {
            pFiles.splice(i, 1);
          }
          continue;
        }

        if (!body.isBeingDragged) {
          body.vy += gravity;

          // Right-click magnetic pad
          if (mouse.isRightDown) {
            const dx = mouse.x - body.x;
            const dy = mouse.y - body.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 15 && dist < 320) {
              const force = (320 - dist) * 0.0035;
              body.vx += (dx / dist) * force;
              body.vy += (dy / dist) * force;
              body.vAngle += 0.01;
            }
          }

          // Vayu Wind Pads & Sarathi AI Autonomous Tractor Guidance
          if (isWind || isSarathiAutopilotEnabled) {
            const targetPortal = portals.find(
              (p) =>
                (body.category === 'pdf' && p.type === 'pdf') ||
                (body.category === 'screenshot' && p.type === 'screenshot') ||
                (body.category === 'archive' && p.type === 'compress') ||
                (body.category === 'installer' && p.type === 'trash') ||
                (body.category === 'messy_temp' && p.type === 'trash')
            );
            if (targetPortal) {
              const dx = targetPortal.x - body.x;
              const dy = targetPortal.y - body.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 10) {
                const tractorForce = isSarathiAutopilotEnabled ? 0.48 * sarathiSpeed : 0.42;
                body.vx += (dx / dist) * tractorForce;
                body.vy += (dy / dist) * tractorForce;
              }

              // Sarathi Escalation Check for large/suspicious files entering Trash
              if (
                isSarathiAutopilotEnabled &&
                targetPortal.type === 'trash' &&
                body.file.sizeBytes > 1024 * 1024 * 35 &&
                !activeEscalation &&
                Math.random() < 0.003
              ) {
                triggerEscalation({
                  id: `esc-file-${body.id}`,
                  title: 'सन्दिग्ध आलेख // High-Capacity File Destiny',
                  description: `File "${body.file.name}" (${(body.file.sizeBytes / (1024 * 1024)).toFixed(1)} MB) is routed for trash pyre.`,
                  riskLevel: 'high',
                  aiConfidence: 0.71,
                  reason: 'Large capacity file flagged for deletion. Verify if file should be preserved in documents or incinerated.',
                  targetArtifact: body.file,
                  moduleId: 'mandara-sifter',
                  suggestedActionLabel: 'Divert to Documents Vault',
                  options: [
                    {
                      id: 'opt-divert',
                      label: 'ग्रन्थागार रक्षण (Divert to Documents)',
                      description: 'Move file safely to /Documents/Archive.',
                      isRecommended: true,
                      actionType: 'divert',
                    },
                    {
                      id: 'opt-trash',
                      label: 'हवन कुण्ड भस्म (Incinerate in Trash)',
                      description: 'Confirm permanent purge from system.',
                      actionType: 'approve',
                    },
                    {
                      id: 'opt-compress',
                      label: 'संग्रह शिला (Compress into .ZIP)',
                      description: 'Archive file into compressed storage.',
                      actionType: 'quarantine',
                    },
                  ],
                });
              }
            }
          }

          body.vx *= body.friction;
          body.vy *= body.friction;
          body.vAngle *= 0.98;

          body.x += body.vx;
          body.y += body.vy;
          body.angle += body.vAngle;

          // Wall boundaries
          const bRadius = body.shape === 'plate' ? body.width * 0.5 : body.radius;
          if (body.x - bRadius < 0) {
            body.x = bRadius;
            body.vx *= -body.restitution;
            body.vAngle *= -0.7;
          } else if (body.x + bRadius > canvas.width) {
            body.x = canvas.width - bRadius;
            body.vx *= -body.restitution;
            body.vAngle *= -0.7;
          }

          if (body.y - bRadius < 0) {
            body.y = bRadius;
            body.vy *= -body.restitution;
          }
        }

        // Bumper Ricochets
        bumpers.forEach((bumper) => {
          const dx = body.x - bumper.x;
          const dy = body.y - bumper.y;
          const dist = Math.hypot(dx, dy);
          const minD = body.radius + bumper.radius;

          if (dist < minD) {
            const overlap = minD - dist;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            body.x += nx * overlap;
            body.y += ny * overlap;

            const dot = body.vx * nx + body.vy * ny;
            const impulse = Math.max(Math.abs(dot) * 1.8, 10);
            body.vx += nx * impulse;
            body.vy += ny * impulse;

            bumper.flashLife = 1.0;
            body.bounces += 1;

            vedicSound.playMridangam('chaapu');
            addParticles(bumper.x, bumper.y, bumper.color, 12);
            addScore(bumper.points);
            addFloatingText(bumper.x, bumper.y - 30, `अमृत चक्र! +${bumper.points}`, bumper.color);
          }
        });

        // Suika Merge Collision Check
        for (let j = i - 1; j >= 0; j--) {
          const other = pFiles[j];
          if (other.isSuctioned) continue;

          const dx = other.x - body.x;
          const dy = other.y - body.y;
          const dist = Math.hypot(dx, dy);
          const combinedR = (body.radius + other.radius) * 0.95;

          if (dist < combinedR) {
            if (
              body.category === other.category &&
              !state.suikaMergedIds.has(body.id) &&
              !state.suikaMergedIds.has(other.id)
            ) {
              state.suikaMergedIds.add(body.id);
              state.suikaMergedIds.add(other.id);

              compressFile(body.id);
              compressFile(other.id);

              body.isSuctioned = true;
              other.isSuctioned = true;

              vedicSound.playTempleBell(1.4, 2.8);
              vedicSound.playMridangam('bass');
              addParticles((body.x + other.x) / 2, (body.y + other.y) / 2, '#fbbf24', 28);
              addFloatingText((body.x + other.x) / 2, (body.y + other.y) / 2 - 20, '🕉️ मन्थन संग्रह (SUIKA BATCH .ZIP)!', '#fbbf24');

              addScore(450);
              incrementCombo();
              setMergesCount((prev) => prev + 1);
              break;
            }

            // Normal elastic bounce
            const overlap = combinedR - dist;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            body.x -= nx * overlap * 0.5;
            body.y -= ny * overlap * 0.5;
            other.x += nx * overlap * 0.5;
            other.y += ny * overlap * 0.5;
          }
        }

        // Check Portal Sucking
        portals.forEach((portal) => {
          const dx = portal.x - body.x;
          const dy = portal.y - body.y;
          const dist = Math.hypot(dx, dy);

          if (dist < portal.radius + 15 && !body.isSuctioned) {
            // Golden Kavacha VIP Protection: Shield sensitive files from Trash Pyre
            if (portal.type === 'trash' && (body.file.isVip || body.file.kavachaActive)) {
              body.vx = -(dx / (dist || 1)) * 9;
              body.vy = -(dy / (dist || 1)) * 9;
              vedicSound.playTempleBell(2.2, 2.5);
              addParticles(portal.x, portal.y, '#fbbf24', 20);
              addFloatingText(portal.x, portal.y - 40, '🛡️ कवचम् रक्षितम्! (VIP Key Shielded)', '#fbbf24');
              return;
            }

            body.isSuctioned = true;
            body.vx = (dx / (dist || 1)) * 5;
            body.vy = (dy / (dist || 1)) * 5;

            vedicSound.playPortalSuction();
            vedicSound.playPunyaChime();
            state.screenShake = 6;
            addParticles(portal.x, portal.y, portal.color, 24);

            // Execute Real Physical Chore
            if (portal.type === 'pdf') {
              moveFile(body.id, portal.destination, 'pdf');
              addFloatingText(portal.x, portal.y - 35, 'ग्रन्थागार रक्षितम् (/Documents)', portal.color);
            } else if (portal.type === 'screenshot') {
              moveFile(body.id, portal.destination, 'screenshot');
              addFloatingText(portal.x, portal.y - 35, 'चित्रवन रक्षितम् (/Pictures)', portal.color);
            } else if (portal.type === 'compress') {
              compressFile(body.id);
              addFloatingText(portal.x, portal.y - 35, 'संग्रह शिला (.ZIP Archive)', portal.color);
            } else if (portal.type === 'trash') {
              deleteFile(body.id);
              addFloatingText(portal.x, portal.y - 35, 'हवन कुण्ड भस्म (~/.Trash)', portal.color);
            }

            setOrganizedCount((prev) => prev + 1);
            addScore(250);
            incrementCombo();
          }
        });
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      // Update Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.018;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // ==========================================
      // 4. RENDER CANVAS SCENE
      // ==========================================
      ctx.save();

      if (state.screenShake > 0 && isScreenShakeEnabled) {
        ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
        state.screenShake = Math.max(0, state.screenShake - 0.5);
      }

      // Deep Sacred Churning Ocean Backdrop
      ctx.fillStyle = '#080a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Temple Water Lattice Grid
      ctx.strokeStyle = '#121727';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render Lotus Bumpers
      bumpers.forEach((bumper) => {
        ctx.save();
        ctx.translate(bumper.x, bumper.y);

        const flash = bumper.flashLife;
        ctx.shadowColor = bumper.color;
        ctx.shadowBlur = 15 + flash * 25;

        // Lotus Petals Ring
        ctx.strokeStyle = bumper.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, bumper.radius + flash * 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = flash > 0 ? '#ffffff' : '#0e1322';
        ctx.beginPath();
        ctx.arc(0, 0, bumper.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 11px "Noto Serif Devanagari", serif';
        ctx.fillStyle = bumper.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${bumper.points}`, 0, 0);

        ctx.restore();
      });

      // Render 4 Sacred Portals (Sanctums)
      portals.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);

        p.pulsePhase += 0.05;
        const pulseScale = 1 + Math.sin(p.pulsePhase) * 0.06;

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 24;

        // Outer Ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * pulseScale, 0, Math.PI * 2);
        ctx.stroke();

        // Swirling Sacred Vortex
        ctx.save();
        ctx.rotate(vortexAngle);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.7, 0, Math.PI * 1.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.45, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
        ctx.restore();

        // Portal Center
        ctx.fillStyle = '#030509';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Portal Label
        ctx.shadowBlur = 0;
        ctx.font = 'bold 11px "Yatra One", "Noto Serif Devanagari", serif';
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.fillText(p.nameDevanagari, 0, p.radius + 18);

        ctx.restore();
      });

      // Render Floating Scrolls & Plates
      pFiles.forEach((body) => {
        ctx.save();
        ctx.translate(body.x, body.y);
        ctx.rotate(body.angle);

        if (body.isSuctioned) {
          const s = Math.max(0.1, 1 - body.suctionProgress);
          ctx.scale(s * 1.5, s * 0.5);
        }

        ctx.shadowColor = body.glowColor;
        ctx.shadowBlur = body.isBeingDragged ? 25 : 12;

        if (body.shape === 'plate') {
          // Ancient Copper Plate / Inscription Box
          const halfW = body.width * 0.5;
          const halfH = body.height * 0.5;

          ctx.fillStyle = body.color;
          ctx.fillRect(-halfW, -halfH, body.width, body.height);

          ctx.fillStyle = '#0c101c';
          ctx.fillRect(-halfW + 3, -halfH + 3, body.width - 6, body.height - 6);

          ctx.shadowBlur = 0;
          ctx.font = 'bold 9px "Noto Serif Devanagari", serif';
          ctx.fillStyle = body.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`.${body.file.extension.toUpperCase()}`, 0, 0);
        } else {
          // Sacred Rolled Parchment Scroll
          ctx.fillStyle = body.color;
          ctx.beginPath();
          ctx.arc(0, 0, body.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0c101c';
          ctx.beginPath();
          ctx.arc(0, 0, body.radius * 0.82, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.font = 'bold 9px "Noto Serif Devanagari", serif';
          ctx.fillStyle = body.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`.${body.file.extension.toUpperCase()}`, 0, 0);
        }

        // File label
        ctx.shadowBlur = 0;
        ctx.font = '10px "Noto Serif Devanagari", serif';
        ctx.fillStyle = '#ede5d5';
        ctx.textAlign = 'center';
        const label = body.file.name.slice(0, 16);
        ctx.fillText(label, 0, (body.shape === 'plate' ? body.height * 0.5 : body.radius) + 14);

        ctx.restore();
      });

      // Render Dotted Trajectory Arc when Dragging
      if (state.draggedBody) {
        const anchor = state.dragAnchor;
        const current = state.dragCurrent;
        const dx = anchor.x - current.x;
        const dy = anchor.y - current.y;

        ctx.save();
        ctx.strokeStyle = state.draggedBody.color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);

        // Tension Brahmic String
        ctx.beginPath();
        ctx.moveTo(anchor.x, anchor.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();

        // Parabolic trajectory forecast dots
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let simX = anchor.x;
        let simY = anchor.y;
        let simVx = dx * 0.18;
        let simVy = dy * 0.18;

        for (let step = 0; step < 18; step++) {
          ctx.lineTo(simX, simY);
          simX += simVx;
          simY += simVy;
          simVy += gravity;
        }
        ctx.stroke();

        ctx.restore();
      }

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
      window.removeEventListener('resize', setupLayout);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [files, isScreenShakeEnabled]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#080a14] overflow-hidden select-none font-sans text-[#ede5d5]">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Top Cyber HUD Bar */}
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
              अध्याय २ // मन्दरा मंथन (MANDARA SIFTER)
            </div>
            <div className="text-sm font-extrabold text-white">
              पुण्य: {stats.karmaPoints.toLocaleString()}
            </div>
          </div>
          <div className="h-6 w-px bg-vedic-gold/30" />
          <div>
            <div className="text-[10px] text-[#cbbda3]">व्यवस्थित फाइल</div>
            <div className="text-sm font-bold text-emerald-400">{organizedCount} Files</div>
          </div>
          <div className="h-6 w-px bg-vedic-gold/30" />
          <div>
            <div className="text-[10px] text-[#cbbda3]">संग्रह शिला</div>
            <div className="text-sm font-bold text-amber-400">{mergesCount} Batches</div>
          </div>
        </div>

        {/* Center: Tapasya Combo */}
        {stats.combo > 1 && (
          <div className="bg-gradient-to-r from-terracotta-deep to-vedic-gold border border-vedic-gold px-4 py-1.5 rounded-full text-white font-devanagari font-bold animate-pulse shadow-vedic-gold flex items-center gap-2">
            <Zap className="w-4 h-4 text-vedic-gold-bright fill-vedic-gold-bright" />
            <span>मन्थन गति x{stats.combo}</span>
          </div>
        )}

        {/* Right Gadget Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Invert Current Flow */}
          <button
            onClick={() => {
              setInvertedCurrent((prev) => !prev);
              vedicSound.playPortalSuction();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl font-bold transition-all shadow-md active:scale-95 text-[11px] ${
              invertedCurrent
                ? 'bg-sky-500/30 text-sky-300 border-sky-400 shadow-md animate-pulse'
                : 'bg-[#181b26]/90 text-[#cbbda3] border-[#373c52] hover:bg-[#252836]'
            }`}
            title="Invert Current Flow Upward [G]"
          >
            <ArrowUpCircle className={`w-3.5 h-3.5 ${invertedCurrent ? 'rotate-180' : ''}`} />
            <span>जलधारा {invertedCurrent ? '[ऊर्ध्व]' : '[अधः]'}</span>
          </button>

          {/* Vayu Wind Pads */}
          <button
            onClick={() => {
              setVayuWindActive((prev) => !prev);
              vedicSound.playMridangam('dheem');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl font-bold transition-all shadow-md active:scale-95 text-[11px] ${
              vayuWindActive
                ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-vedic-gold animate-pulse'
                : 'bg-[#181b26]/90 text-[#cbbda3] border-[#373c52] hover:bg-[#252836]'
            }`}
            title="Toggle Vayu Wind Sorting Pads [M]"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>वायु चक्र {vayuWindActive ? '[सक्रिय]' : '[शांत]'}</span>
          </button>

          {/* Manual Drop Clutter */}
          <button
            onClick={() => {
              stateRef.current.nextDropTime = 0;
              vedicSound.playMridangam('chaapu');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#181b26]/90 hover:bg-[#252836] border border-[#373c52] text-[#ede5d5] rounded-xl font-bold transition-all shadow-md active:scale-95 text-[11px]"
            title="Drop More Files from Downloads"
          >
            <PlusCircle className="w-3.5 h-3.5 text-vedic-gold-bright" />
            <span>नवीन फाइल</span>
          </button>

          {/* Reality Lens */}
          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-terracotta-deep to-[#7c2d12] hover:from-[#9a3412] hover:to-terracotta-deep border border-vedic-gold/60 text-vedic-gold-bright rounded-xl font-bold transition-all shadow-md active:scale-95 text-[11px]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>प्रत्यक्ष दर्शन [Tab]</span>
          </button>
        </div>
      </div>

      {/* Bottom Guidance Footer */}
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[11px] text-[#cbbda3] font-serif bg-[#121522]/90 border border-vedic-gold/40 backdrop-blur-md px-4 py-2 rounded-2xl pointer-events-none z-10">
        <div className="flex items-center gap-4">
          <span><strong className="text-white">[Left Drag + Release]:</strong> Slingshot Catapult</span>
          <span><strong className="text-sky-300">[Right Click Hold]:</strong> Vayu Tractor Current</span>
          <span><strong className="text-amber-300">[Lotus Bumpers]:</strong> Ricochet for Trick Shot Combos</span>
          <span><strong className="text-emerald-300">[Suika Merge]:</strong> Slam duplicate files together to compress</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-sky-300">[Blue = Documents]</span>
          <span className="text-emerald-300">[Green = Pictures]</span>
          <span className="text-amber-300">[Gold = Zip Archive]</span>
          <span className="text-red-400">[Red = Trash Pyre]</span>
        </div>
      </div>
    </div>
  );
};
