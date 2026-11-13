'use client';

import React, { useEffect, useState } from 'react';

export function NeonCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Detect touch device or reduced motion
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      setIsTouchDevice(true);
      return;
    }
    setIsTouchDevice(false);

    let rafId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.getAttribute('role') === 'button' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('cursor-pointer'))
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const animate = () => {
      // Smooth lerp for outer halo
      currentX += (targetX - currentX) * 0.25;
      currentY += (targetY - currentY) * 0.25;
      setPosition({ x: currentX, y: currentY });
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300">
      {/* Outer Neon Halo */}
      <div
        className="absolute rounded-full transition-[width,height,background-color,border-color] duration-150 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
          width: isHovering ? '44px' : '26px',
          height: isHovering ? '44px' : '26px',
          backgroundColor: isHovering ? 'rgba(181, 255, 85, 0.15)' : 'rgba(66, 223, 255, 0.08)',
          border: isHovering ? '1.5px solid rgba(181, 255, 85, 0.6)' : '1px solid rgba(66, 223, 255, 0.3)',
          boxShadow: isHovering
            ? '0 0 16px rgba(181, 255, 85, 0.4)'
            : '0 0 10px rgba(66, 223, 255, 0.2)',
        }}
      />
      {/* Center Precision Dot */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-[#B5FF55] transition-transform duration-75"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
          boxShadow: '0 0 6px #B5FF55',
        }}
      />
    </div>
  );
}
