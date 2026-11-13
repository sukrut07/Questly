'use client';

import React, { useRef, useEffect } from 'react';

interface InteractiveGraphBackgroundProps {
  className?: string;
  cellSize?: number;
  glowColor?: 'lime' | 'cyan' | 'purple' | 'orange';
  intensity?: number;
  showCoordinates?: boolean;
}

export function InteractiveGraphBackground({
  className = '',
  cellSize = 32,
  glowColor = 'lime',
  intensity = 1.0,
  showCoordinates = true,
}: InteractiveGraphBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colorMap = {
    lime: { r: 181, g: 255, b: 85 },
    cyan: { r: 66, g: 223, b: 255 },
    purple: { r: 168, g: 121, b: 255 },
    orange: { r: 255, g: 156, b: 69 },
  };

  const activeColor = colorMap[glowColor] || colorMap.lime;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Pointer target and smooth current position
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isHovering = false;
    let glowAlpha = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      isHovering = true;
    };

    const handlePointerLeave = () => {
      isHovering = false;
    };

    // Attach listeners to parent container so it catches events even if canvas is pointer-events-none
    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handlePointerMove, { passive: true });
      parent.addEventListener('mouseleave', handlePointerLeave);
    }

    const resizeObserver = new ResizeObserver(() => resize());
    if (parent) resizeObserver.observe(parent);
    resize();

    const radius = 150; // Radius of illumination glow

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Lerp pointer position
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      // Smooth fade of glow alpha
      if (isHovering && !prefersReducedMotion) {
        glowAlpha += (1 - glowAlpha) * 0.1;
      } else {
        glowAlpha += (0 - glowAlpha) * 0.08;
      }

      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);

      // 1. Draw Static Stable Base Grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(48, 54, 66, 0.45)'; // #303642 border with opacity

      ctx.beginPath();
      for (let x = 0; x <= width; x += cellSize) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }
      for (let y = 0; y <= height; y += cellSize) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
      ctx.stroke();

      // 2. Draw Subtle Crosshair Coordinate Markers at grid intersections every 4 cells
      ctx.strokeStyle = 'rgba(160, 164, 174, 0.25)';
      ctx.lineWidth = 1;
      const crossSize = 3;
      for (let c = 0; c <= cols; c += 4) {
        for (let r = 0; r <= rows; r += 4) {
          const cx = c * cellSize + 0.5;
          const cy = r * cellSize + 0.5;
          ctx.beginPath();
          ctx.moveTo(cx - crossSize, cy);
          ctx.lineTo(cx + crossSize, cy);
          ctx.moveTo(cx, cy - crossSize);
          ctx.lineTo(cx, cy + crossSize);
          ctx.stroke();
        }
      }

      // 3. Interactive Illumination of nearby cells
      if (glowAlpha > 0.01 && !prefersReducedMotion) {
        const startCol = Math.max(0, Math.floor((currentX - radius) / cellSize));
        const endCol = Math.min(cols, Math.ceil((currentX + radius) / cellSize));
        const startRow = Math.max(0, Math.floor((currentY - radius) / cellSize));
        const endRow = Math.min(rows, Math.ceil((currentY + radius) / cellSize));

        for (let c = startCol; c < endCol; c++) {
          for (let r = startRow; r < endRow; r++) {
            const cellCenterX = c * cellSize + cellSize / 2;
            const cellCenterY = r * cellSize + cellSize / 2;
            const dist = Math.hypot(currentX - cellCenterX, currentY - cellCenterY);

            if (dist < radius) {
              const proximity = Math.pow(1 - dist / radius, 2) * glowAlpha * intensity;

              // Cell surface soft illumination
              ctx.fillStyle = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${
                proximity * 0.12
              })`;
              ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 1, cellSize - 1);

              // Cell perimeter neon highlight
              ctx.strokeStyle = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${
                proximity * 0.65
              })`;
              ctx.lineWidth = 1.2;
              ctx.strokeRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize, cellSize);
            }
          }
        }

        // Active Coordinate Label Tag near pointer
        if (showCoordinates && glowAlpha > 0.3) {
          const activeCol = Math.floor(currentX / cellSize);
          const activeRow = Math.floor(currentY / cellSize);
          const coordText = `[${String(activeCol).padStart(2, '0')},${String(activeRow).padStart(2, '0')}]`;

          ctx.font = '9px var(--font-mono, monospace)';
          ctx.fillStyle = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${
            glowAlpha * 0.75
          })`;
          ctx.fillText(coordText, currentX + 14, currentY - 12);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (parent) {
        parent.removeEventListener('mousemove', handlePointerMove);
        parent.removeEventListener('mouseleave', handlePointerLeave);
        resizeObserver.disconnect();
      }
    };
  }, [cellSize, glowColor, intensity, showCoordinates, activeColor.r, activeColor.g, activeColor.b]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 select-none ${className}`}
      aria-hidden="true"
    />
  );
}
