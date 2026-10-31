import React, { useRef, useEffect, useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { sound } from '../../lib/audio/soundEngine';
import { FileArtifact } from '../../types';
import {
  ArrowLeft,
  Eye,
  Zap,
  Magnet,
  ArrowUpCircle,
  PlusCircle,
  Crosshair,
} from 'lucide-react';

type ShapeType = 'circle' | 'box';

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
  isBeingDragged: boolean;
  suctionProgress: number; // 0 to 1 for spaghettification
  isSuctioned: boolean;
  bounces: number;
}

interface Wormhole {
  id: string;
  name: string;
  destination: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'pdf' | 'screenshot' | 'compress' | 'trash';
  pulsePhase: number;
}

interface Bumper {
  x: number;
  y: number;
  radius: number;
  color: string;
  flashLife: number; // for hit flare
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

export const GravitySifter: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
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
  } = useTransactionStore();

  const [magnetActive, setMagnetActive] = useState(false);
  const [invertedGravity, setInvertedGravity] = useState(false);
  const [organizedCount, setOrganizedCount] = useState(0);
  const [mergesCount, setMergesCount] = useState(0);
  const [trickShotsCount, setTrickShotsCount] = useState(0);

  const stateRef = useRef({
    files: [] as PhysicsBody[],
    wormholes: [] as Wormhole[],
    bumpers: [] as Bumper[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    draggedBody: null as PhysicsBody | null,
    dragAnchor: { x: 0, y: 0 },
    dragCurrent: { x: 0, y: 0 },
    mouse: { x: 0, y: 0, isDown: false, isRightDown: false },
    gravity: 0.32,
    magnetActive: false,
    invertedGravity: false,
    nextDropTime: 0,
    screenShake: 0,
    suikaMergedIds: new Set<string>(),
  });

  useEffect(() => {
    stateRef.current.magnetActive = magnetActive;
  }, [magnetActive]);

  useEffect(() => {
    stateRef.current.invertedGravity = invertedGravity;
    stateRef.current.gravity = invertedGravity ? -0.28 : 0.32;
  }, [invertedGravity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sound.init();

    // Responsive Canvas Resize & Static Layout Setup
    const setupLayout = () => {
      if (!containerRef.current || !canvas) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;

      const w = canvas.width;
      const h = canvas.height;

      // 4 Dimensional Portals placed along the lower zone
      stateRef.current.wormholes = [
        {
          id: 'portal-pdf',
          name: 'DOCS / PDFs (/2026)',
          destination: '/Documents/PDFs/2026',
          x: w * 0.16,
          y: h - 75,
          radius: 54,
          color: '#00f3ff',
          type: 'pdf',
          pulsePhase: 0,
        },
        {
          id: 'portal-ss',
          name: 'SCREENSHOTS (/Pictures)',
          destination: '/Pictures/Screenshots',
          x: w * 0.38,
          y: h - 75,
          radius: 54,
          color: '#00ff66',
          type: 'screenshot',
          pulsePhase: Math.PI * 0.5,
        },
        {
          id: 'portal-zip',
          name: 'COMPRESSOR (.ZIP)',
          destination: '/Archives',
          x: w * 0.62,
          y: h - 75,
          radius: 54,
          color: '#a855f7',
          type: 'compress',
          pulsePhase: Math.PI,
        },
        {
          id: 'portal-trash',
          name: 'BLACK HOLE (~/.Trash)',
          destination: '~/.Trash',
          x: w * 0.84,
          y: h - 75,
          radius: 54,
          color: '#ff0055',
          type: 'trash',
          pulsePhase: Math.PI * 1.5,
        },
      ];

      // Pinball Obstacle Bumpers in mid-air
      stateRef.current.bumpers = [
        { x: w * 0.28, y: h * 0.38, radius: 26, color: '#00f3ff', flashLife: 0, points: 50 },
        { x: w * 0.50, y: h * 0.26, radius: 30, color: '#ffaa00', flashLife: 0, points: 100 },
        { x: w * 0.72, y: h * 0.38, radius: 26, color: '#00ff66', flashLife: 0, points: 50 },
      ];
    };

    setupLayout();
    window.addEventListener('resize', setupLayout);

    // Initial pool of physical files from unorganized Downloads
    const unorganized = files.filter((f) => f.status === 'in_downloads');
    const initialPool = unorganized.slice(0, 15);

    const createBody = (f: FileArtifact, x: number, y: number, vx = 0, vy = 0): PhysicsBody => {
      const isBox = f.category === 'pdf' || f.category === 'installer' || f.category === 'archive';
      const radius = f.category === 'installer' ? 32 : f.category === 'pdf' ? 26 : f.category === 'screenshot' ? 24 : 20;
      const width = radius * 2.1;
      const height = radius * 1.5;

      const colorMap = {
        pdf: '#00f3ff',
        screenshot: '#00ff66',
        archive: '#a855f7',
        installer: '#ffaa00',
        messy_temp: '#ff0055',
      };

      const glowMap = {
        pdf: 'rgba(0, 243, 255, 0.45)',
        screenshot: 'rgba(0, 255, 102, 0.45)',
        archive: 'rgba(168, 85, 247, 0.45)',
        installer: 'rgba(255, 170, 0, 0.45)',
        messy_temp: 'rgba(255, 0, 85, 0.45)',
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
        shape: isBox ? 'box' : 'circle',
        radius,
        width,
        height,
        mass: isBox ? (width * height) / 350 : (Math.PI * radius * radius) / 400,
        restitution: 0.68, // Elastic bounciness
        friction: 0.985,
        color: colorMap[f.category] || '#38bdf8',
        glowColor: glowMap[f.category] || 'rgba(56, 189, 248, 0.4)',
        category: f.category,
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

    // Helper: Add Particle Bursts
    const addParticles = (x: number, y: number, color: string, count = 18, speedMult = 1) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (1.5 + Math.random() * 4.5) * speedMult;
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
        scale: 1,
      });
    };

    // Controls: Mouse & Slingshot Interaction
    const getCanvasPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const pos = getCanvasPos(e);
      stateRef.current.mouse.x = pos.x;
      stateRef.current.mouse.y = pos.y;

      if (e.button === 2) {
        // Right click: Magnetic Tractor Field
        e.preventDefault();
        stateRef.current.mouse.isRightDown = true;
        sound.playTractorBeam();
        return;
      }

      if (e.button === 0) {
        // Left click: Grab & Slingshot Aim
        stateRef.current.mouse.isDown = true;
        const pFiles = stateRef.current.files;

        for (let i = pFiles.length - 1; i >= 0; i--) {
          const body = pFiles[i];
          const dist = Math.hypot(pos.x - body.x, pos.y - body.y);
          const hitRadius = body.shape === 'box' ? Math.max(body.width, body.height) * 0.6 : body.radius + 6;

          if (dist <= hitRadius && !body.isSuctioned) {
            body.isBeingDragged = true;
            body.vx = 0;
            body.vy = 0;
            stateRef.current.draggedBody = body;
            stateRef.current.dragAnchor = { x: body.x, y: body.y };
            stateRef.current.dragCurrent = { x: pos.x, y: pos.y };
            sound.playMagnetSnap();
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

          // Slingshot release: vector from current cursor to anchor
          const dx = anchor.x - current.x;
          const dy = anchor.y - current.y;
          const pullDist = Math.hypot(dx, dy);

          if (pullDist > 15) {
            // Apply catapult impulse
            const power = Math.min(pullDist * 0.18, 22);
            dragged.vx = (dx / pullDist) * power;
            dragged.vy = (dy / pullDist) * power;
            dragged.vAngle = (Math.random() - 0.5) * 0.25;
            sound.playSlingshotFling();
            addParticles(dragged.x, dragged.y, dragged.color, 14);
          }

          dragged.isBeingDragged = false;
          stateRef.current.draggedBody = null;
        }
        stateRef.current.mouse.isDown = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setMagnetActive((prev) => !prev);
        sound.playMagnetSnap();
      }
      if (e.key === 'g' || e.key === 'G') {
        setInvertedGravity((prev) => !prev);
        sound.playGravityFlip();
      }
    };

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
        const hitRadius = body.shape === 'box' ? Math.max(body.width, body.height) * 0.7 : body.radius + 12;

        if (dist <= hitRadius && !body.isSuctioned) {
          body.isBeingDragged = true;
          body.vx = 0;
          body.vy = 0;
          stateRef.current.draggedBody = body;
          stateRef.current.dragAnchor = { x: body.x, y: body.y };
          stateRef.current.dragCurrent = { x: pos.x, y: pos.y };
          sound.playMagnetSnap();
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

        if (pullDist > 12) {
          const power = Math.min(pullDist * 0.18, 22);
          dragged.vx = (dx / pullDist) * power;
          dragged.vy = (dy / pullDist) * power;
          dragged.vAngle = (Math.random() - 0.5) * 0.25;
          sound.playSlingshotFling();
          addParticles(dragged.x, dragged.y, dragged.color, 14);
        }

        dragged.isBeingDragged = false;
        stateRef.current.draggedBody = null;
      }
      stateRef.current.mouse.isDown = false;
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
    // 60 FPS ADVANCED RIGID-BODY PHYSICS ENGINE
    // ==========================================
    let animationId: number;
    let vortexAngle = 0;

    const loop = (currentTime: number) => {
      vortexAngle += 0.04;
      const state = stateRef.current;
      const {
        files: pFiles,
        wormholes,
        bumpers,
        particles,
        floatingTexts,
        gravity,
        magnetActive: isMagnet,
        mouse,
      } = state;

      // 1. Drop Continuous Chaotic Downloads if pool drops
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

      // 2. Update Bumpers Animation
      bumpers.forEach((b) => {
        if (b.flashLife > 0) b.flashLife -= 0.05;
      });

      // 3. Update Physics Bodies
      for (let i = pFiles.length - 1; i >= 0; i--) {
        const body = pFiles[i];

        // Suction & Spaghettification into Portal
        if (body.isSuctioned) {
          body.suctionProgress += 0.06;
          body.angle += 0.25;
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
          // Apply gravity
          body.vy += gravity;

          // Right-Click Magnetic Cursor Field
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

          // Ambient Attractor Magnet Pad (M key)
          if (isMagnet) {
            const targetHole = wormholes.find(
              (w) =>
                (body.category === 'pdf' && w.type === 'pdf') ||
                (body.category === 'screenshot' && w.type === 'screenshot') ||
                (body.category === 'archive' && w.type === 'compress') ||
                (body.category === 'installer' && w.type === 'trash') ||
                (body.category === 'messy_temp' && w.type === 'trash')
            );
            if (targetHole) {
              const dx = targetHole.x - body.x;
              const dy = targetHole.y - body.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 10) {
                body.vx += (dx / dist) * 0.42;
                body.vy += (dy / dist) * 0.42;
              }
            }
          }

          // Friction & Velocity Updates
          body.vx *= body.friction;
          body.vy *= body.friction;
          body.vAngle *= 0.98;

          body.x += body.vx;
          body.y += body.vy;
          body.angle += body.vAngle;

          // Boundary Collisions (Left, Right, Top, Bottom)
          const bRadius = body.shape === 'box' ? body.width * 0.5 : body.radius;

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
          } else if (body.y + bRadius > canvas.height - 8) {
            body.y = canvas.height - 8 - bRadius;
            body.vy *= -body.restitution;
            body.vx *= 0.92;
          }

          // Bumper Collisions (Pinball Mechanics)
          bumpers.forEach((bumper) => {
            const bdx = body.x - bumper.x;
            const bdy = body.y - bumper.y;
            const bdist = Math.hypot(bdx, bdy);
            const minBumperDist = bRadius + bumper.radius;

            if (bdist < minBumperDist && bdist > 0.001) {
              const nx = bdx / bdist;
              const ny = bdy / bdist;

              // Force separation
              body.x = bumper.x + nx * minBumperDist;
              body.y = bumper.y + ny * minBumperDist;

              // High-impulse ricochet!
              const bounceSpeed = Math.max(14, Math.hypot(body.vx, body.vy) * 1.5);
              body.vx = nx * bounceSpeed;
              body.vy = ny * bounceSpeed;
              body.vAngle = (Math.random() - 0.5) * 0.4;
              body.bounces += 1;

              bumper.flashLife = 1.0;
              sound.playPinballBumper();
              addParticles(bumper.x, bumper.y, bumper.color, 16, 1.2);

              if (body.bounces >= 2) {
                addFloatingText(bumper.x, bumper.y - 30, '⚡ TRICK SHOT! x2', '#ffaa00');
                setTrickShotsCount((prev) => prev + 1);
                addScore(bumper.points * 2);
                incrementCombo();
              } else {
                addScore(bumper.points);
              }
            }
          });
        }

        // Wormhole Suction Verification
        for (let j = 0; j < wormholes.length; j++) {
          const hole = wormholes[j];
          const dx = hole.x - body.x;
          const dy = hole.y - body.y;
          const dist = Math.hypot(dx, dy);

          // Gravitational horizon pull
          if (dist < hole.radius + 45) {
            body.vx += (dx / dist) * 0.85;
            body.vy += (dy / dist) * 0.85;

            // Swallowed by Singular Vortex!
            if (dist < hole.radius * 0.65 && !body.isSuctioned) {
              body.isSuctioned = true;
              body.vx = (dx / dist) * 2;
              body.vy = (dy / dist) * 2;

              addParticles(hole.x, hole.y, hole.color, 36, 1.4);
              sound.playWormholeSuck();
              state.screenShake = 6;

              // Physically execute atomic digital chore transaction!
              if (hole.type === 'pdf') {
                moveFile(body.id, '/Documents/PDFs/2026', body.category);
                addFloatingText(hole.x, hole.y - 45, 'ROUTED → /Documents/PDFs/2026', '#00f3ff');
              } else if (hole.type === 'screenshot') {
                moveFile(body.id, '/Pictures/Screenshots', body.category);
                addFloatingText(hole.x, hole.y - 45, 'ROUTED → /Pictures/Screenshots', '#00ff66');
              } else if (hole.type === 'compress') {
                compressFile(body.id);
                sound.playCompression();
                addFloatingText(hole.x, hole.y - 45, 'BATCHED INTO .ZIP (-45%)', '#a855f7');
              } else if (hole.type === 'trash') {
                deleteFile(body.id);
                sound.playExplosion('small');
                addFloatingText(hole.x, hole.y - 45, 'PURGED TO ~/.Trash', '#ff0055');
              }

              setOrganizedCount((prev) => prev + 1);
              addScore(250);
              incrementCombo();
              break;
            }
          }
        }
      }

      // 4. Suika-Style File Collisions & Merges
      for (let i = 0; i < pFiles.length; i++) {
        for (let j = i + 1; j < pFiles.length; j++) {
          const b1 = pFiles[i];
          const b2 = pFiles[j];

          if (b1.isSuctioned || b2.isSuctioned) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const r1 = b1.shape === 'box' ? b1.width * 0.5 : b1.radius;
          const r2 = b2.shape === 'box' ? b2.width * 0.5 : b2.radius;
          const minDist = r1 + r2;

          if (dist < minDist && dist > 0.001) {
            // Check Suika Merge condition: same category & colliding with velocity
            const relSpeed = Math.hypot(b1.vx - b2.vx, b1.vy - b2.vy);
            const canMerge =
              b1.category === b2.category &&
              (b1.category === 'screenshot' || b1.category === 'messy_temp') &&
              relSpeed > 3.5 &&
              !state.suikaMergedIds.has(b1.id) &&
              !state.suikaMergedIds.has(b2.id);

            if (canMerge) {
              state.suikaMergedIds.add(b1.id);
              state.suikaMergedIds.add(b2.id);

              sound.playSuikaMerge();
              compressFile(b1.id);
              compressFile(b2.id);

              addParticles((b1.x + b2.x) / 2, (b1.y + b2.y) / 2, '#a855f7', 28, 1.5);
              addFloatingText(
                (b1.x + b2.x) / 2,
                (b1.y + b2.y) / 2 - 25,
                '🌟 SUIKA MERGE: BATCHED ARCHIVE!',
                '#a855f7'
              );

              setMergesCount((prev) => prev + 1);
              addScore(600);
              incrementCombo();
            }

            // Elastic Collision Response (Circle-Circle & Box Approximation)
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            if (!b1.isBeingDragged) {
              b1.x -= nx * overlap;
              b1.y -= ny * overlap;
            }
            if (!b2.isBeingDragged) {
              b2.x += nx * overlap;
              b2.y += ny * overlap;
            }

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = (2 * (nx * kx + ny * ky)) / (b1.mass + b2.mass);
            const rest = Math.min(b1.restitution, b2.restitution);

            if (!b1.isBeingDragged) {
              b1.vx -= p * b2.mass * nx * rest;
              b1.vy -= p * b2.mass * ny * rest;
              b1.vAngle += (Math.random() - 0.5) * 0.08;
            }
            if (!b2.isBeingDragged) {
              b2.vx += p * b1.mass * nx * rest;
              b2.vy += p * b1.mass * ny * rest;
              b2.vAngle += (Math.random() - 0.5) * 0.08;
            }
          }
        }
      }

      // 5. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      // 6. Update Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.018;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // ==========================================
      // 7. RENDER FULL CANVAS SCENE
      // ==========================================
      ctx.save();

      // Screen Shake
      if (state.screenShake > 0 && isScreenShakeEnabled) {
        ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
        state.screenShake = Math.max(0, state.screenShake - 0.5);
      }

      ctx.fillStyle = '#080a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Chamber Grid
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

      // Inverted Gravity Field Visual Rays
      if (state.invertedGravity) {
        ctx.fillStyle = 'rgba(0, 243, 255, 0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
        ctx.setLineDash([4, 12]);
        for (let x = 40; x < canvas.width; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, canvas.height);
          ctx.lineTo(x, 0);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // Right-Click Magnetic Force Lines to Cursor
      if (mouse.isRightDown) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
        ctx.lineWidth = 1.5;
        pFiles.forEach((b) => {
          const d = Math.hypot(mouse.x - b.x, mouse.y - b.y);
          if (d < 320) {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });

        // Pulsing cursor aura
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 35 + Math.sin(currentTime * 0.01) * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Pinball Bumpers
      bumpers.forEach((bumper) => {
        ctx.save();
        ctx.translate(bumper.x, bumper.y);

        const flash = bumper.flashLife;
        ctx.shadowColor = bumper.color;
        ctx.shadowBlur = 15 + flash * 25;

        // Bumper Outer Ring
        ctx.strokeStyle = bumper.color;
        ctx.lineWidth = 3 + flash * 3;
        ctx.beginPath();
        ctx.arc(0, 0, bumper.radius + flash * 6, 0, Math.PI * 2);
        ctx.stroke();

        // Inner core
        ctx.fillStyle = flash > 0 ? '#ffffff' : '#0e1322';
        ctx.beginPath();
        ctx.arc(0, 0, bumper.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = bumper.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${bumper.points}`, 0, 0);

        ctx.restore();
      });

      // Render Dimensional Wormholes / Portals
      wormholes.forEach((hole) => {
        ctx.save();
        ctx.translate(hole.x, hole.y);

        hole.pulsePhase += 0.05;
        const pulseScale = 1 + Math.sin(hole.pulsePhase) * 0.06;

        ctx.shadowColor = hole.color;
        ctx.shadowBlur = 24;

        // Outer Event Horizon Accretion Disk
        ctx.strokeStyle = hole.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, hole.radius * pulseScale, 0, Math.PI * 2);
        ctx.stroke();

        // Rotating Vortex Spirals
        ctx.save();
        ctx.rotate(vortexAngle);
        ctx.strokeStyle = hole.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, hole.radius * 0.7, 0, Math.PI * 1.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, hole.radius * 0.45, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
        ctx.restore();

        // Deep Singularity Center
        ctx.fillStyle = '#030509';
        ctx.beginPath();
        ctx.arc(0, 0, hole.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.shadowBlur = 0;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillStyle = hole.color;
        ctx.textAlign = 'center';
        ctx.fillText(hole.name, 0, hole.radius + 20);

        ctx.restore();
      });

      // Render Rigid Bodies (Orbs & Crates)
      pFiles.forEach((body) => {
        ctx.save();
        ctx.translate(body.x, body.y);
        ctx.rotate(body.angle);

        // Suction scale (spaghettification)
        if (body.isSuctioned) {
          const s = Math.max(0.1, 1 - body.suctionProgress);
          ctx.scale(s * 1.5, s * 0.5);
        }

        ctx.shadowColor = body.glowColor;
        ctx.shadowBlur = body.isBeingDragged ? 25 : 12;

        if (body.shape === 'box') {
          // Bouncy Crate / Container
          const halfW = body.width * 0.5;
          const halfH = body.height * 0.5;

          ctx.fillStyle = body.color;
          ctx.fillRect(-halfW, -halfH, body.width, body.height);

          // Dark Inner Crate Panel
          ctx.fillStyle = '#0c101c';
          ctx.fillRect(-halfW + 3, -halfH + 3, body.width - 6, body.height - 6);

          // Crate corner rivets
          ctx.fillStyle = body.color;
          ctx.fillRect(-halfW + 4, -halfH + 4, 3, 3);
          ctx.fillRect(halfW - 7, -halfH + 4, 3, 3);
          ctx.fillRect(-halfW + 4, halfH - 7, 3, 3);
          ctx.fillRect(halfW - 7, halfH - 7, 3, 3);

          // Extension glyph
          ctx.shadowBlur = 0;
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = body.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`.${body.file.extension.toUpperCase()}`, 0, 0);
        } else {
          // Bouncy Sphere / Orb
          ctx.fillStyle = body.color;
          ctx.beginPath();
          ctx.arc(0, 0, body.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0c101c';
          ctx.beginPath();
          ctx.arc(0, 0, body.radius * 0.82, 0, Math.PI * 2);
          ctx.fill();

          // Extension glyph
          ctx.shadowBlur = 0;
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = body.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`.${body.file.extension.toUpperCase()}`, 0, 0);
        }

        // Truncated Filename label
        ctx.shadowBlur = 0;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        const label = body.file.name.slice(0, 15);
        ctx.fillText(label, 0, (body.shape === 'box' ? body.height * 0.5 : body.radius) + 12);

        ctx.restore();
      });

      // Render Slingshot Aiming Trajectory Line
      if (state.draggedBody) {
        const anchor = state.dragAnchor;
        const current = state.dragCurrent;
        const dx = anchor.x - current.x;
        const dy = anchor.y - current.y;

        ctx.save();
        ctx.strokeStyle = state.draggedBody.color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);

        // Tension string
        ctx.beginPath();
        ctx.moveTo(anchor.x, anchor.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();

        // Trajectory forecast arc
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let simX = anchor.x;
        let simY = anchor.y;
        let simVx = (dx * 0.18);
        let simVy = (dy * 0.18);

        for (let step = 0; step < 16; step++) {
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

      // Render Floating Combat / Sorter Texts
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
  }, [files]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#080a12] overflow-hidden select-none font-mono">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Cyber HUD Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 text-xs">
        {/* Left: Mission Stats */}
        <div className="flex items-center gap-3 bg-[#0d111a]/85 border border-blue-500/40 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-neon-cyan">
          <button
            onClick={onBackToHub}
            className="pointer-events-auto p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
            title="Return to Cabinet Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-blue-400 tracking-wider font-bold">MODULE B // GRAVITY SIFTER</div>
            <div className="text-sm font-extrabold text-white">SCORE: {stats.score.toLocaleString()}</div>
          </div>
          <div className="h-6 w-px bg-blue-500/30" />
          <div>
            <div className="text-[10px] text-slate-400">ORGANIZED</div>
            <div className="text-sm font-bold text-emerald-400">{organizedCount} files</div>
          </div>
          <div className="h-6 w-px bg-blue-500/30" />
          <div>
            <div className="text-[10px] text-slate-400">SUIKA MERGES</div>
            <div className="text-sm font-bold text-purple-400">{mergesCount} batches</div>
          </div>
          <div className="h-6 w-px bg-blue-500/30" />
          <div>
            <div className="text-[10px] text-slate-400">FREED DISK</div>
            <div className="text-sm font-bold text-cyan-300">{stats.megabytesFreed} MB</div>
          </div>
        </div>

        {/* Center: Combo Multiplier */}
        {stats.combo > 1 && (
          <div className="bg-gradient-to-r from-blue-950 to-emerald-950 border border-emerald-500/60 px-4 py-1.5 rounded-full text-emerald-300 font-bold animate-pulse shadow-neon-matrix flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>SORTING STREAK x{stats.combo}</span>
          </div>
        )}

        {/* Right Gadget Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Gravity Inversion Toggle */}
          <button
            onClick={() => {
              setInvertedGravity((prev) => !prev);
              sound.playGravityFlip();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded font-bold transition-all shadow-md active:scale-95 text-[11px] ${
              invertedGravity
                ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 shadow-neon-cyan animate-pulse'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Invert Gravity Field [G]"
          >
            <ArrowUpCircle className={`w-3.5 h-3.5 ${invertedGravity ? 'rotate-180' : ''}`} />
            <span>Gravity {invertedGravity ? '[INVERTED]' : '[DOWN]'}</span>
          </button>

          {/* Magnet Auto-Attractor Toggle */}
          <button
            onClick={() => {
              setMagnetActive((prev) => !prev);
              sound.playMagnetSnap();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded font-bold transition-all shadow-md active:scale-95 text-[11px] ${
              magnetActive
                ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-neon-amber animate-pulse'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Toggle Magnetized Attractor Pads [M]"
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>Magnet {magnetActive ? '[ACTIVE]' : '[OFF]'}</span>
          </button>

          {/* Manual Drop Clutter */}
          <button
            onClick={() => {
              stateRef.current.nextDropTime = 0;
              sound.playMagnetSnap();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-bold transition-all shadow-md active:scale-95 text-[11px]"
            title="Drop More Files from Downloads"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Drop Files</span>
          </button>

          {/* Reality Lens Desk Switch */}
          <button
            onClick={toggleRealityLens}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/60 text-blue-300 rounded font-bold transition-all shadow-md active:scale-95 text-[11px]"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Reality Disk (Tab)
          </button>
        </div>
      </div>

      {/* Interactive Controls & Mechanic Guidance */}
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[11px] text-slate-400 font-mono bg-[#0c0e17]/85 border border-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl pointer-events-none z-10">
        <div className="flex items-center gap-4">
          <span><strong className="text-white">[Left Drag + Release]:</strong> Slingshot Catapult</span>
          <span><strong className="text-cyan-400">[Right Click Hold]:</strong> Magnetic Tractor Beam</span>
          <span><strong className="text-amber-400">[Bumpers]:</strong> Ricochet for Trick Shot Combos</span>
          <span><strong className="text-purple-400">[Suika Merge]:</strong> Slam duplicate files together to compress</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-cyan-300">[Blue = PDFs]</span>
          <span className="text-emerald-300">[Green = Screenshots]</span>
          <span className="text-purple-300">[Purple = Zip]</span>
          <span className="text-red-300">[Red = Trash]</span>
        </div>
      </div>
    </div>
  );
};
