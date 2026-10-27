import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  if (typeof window === 'undefined') return;

  const count = 160;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#8B7CFF', '#68BCFF', '#F5C96A'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#70DDAA', '#FF7D91', '#8B7CFF'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#F5C96A', '#68BCFF', '#70DDAA'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#8B7CFF', '#F5F6FC'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#68BCFF', '#FF7D91'],
  });
}
