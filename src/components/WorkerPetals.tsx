import { useEffect, useRef } from 'react';
import { useStudioStore } from '../store';

type Petal = { x: number; y: number; vx: number; vy: number; spin: number; angle: number; size: number };

export default function WorkerPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enabled = useStudioStore(s => s.motionEnabled);
  const quality = useStudioStore(s => s.quality);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context || !enabled) return;
    const worker = new Worker(new URL('../workers/petal.worker.ts', import.meta.url), { type: 'module' });
    let raf = 0;
    let last = performance.now();
    let particles: Petal[] = [];
    let width = 1;
    let height = 1;
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.8 : 1.2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      worker.postMessage({ type: 'resize', width, height });
    };
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const delta = Math.min(.034, (now - last) / 1000); last = now;
      worker.postMessage({ type: 'tick', delta });
      context.clearRect(0, 0, width, height);
      for (const p of particles) {
        context.save(); context.translate(p.x, p.y); context.rotate(p.angle);
        const gradient = context.createLinearGradient(-p.size, -p.size, p.size, p.size);
        gradient.addColorStop(0, 'rgba(255,225,191,.72)'); gradient.addColorStop(1, 'rgba(174,86,95,.54)');
        context.fillStyle = gradient; context.beginPath();
        context.moveTo(0, -p.size); context.bezierCurveTo(p.size * 1.1, -p.size * .5, p.size * .9, p.size * .8, 0, p.size);
        context.bezierCurveTo(-p.size * .9, p.size * .8, -p.size * 1.1, -p.size * .5, 0, -p.size); context.fill();
        context.restore();
      }
    };
    worker.onmessage = event => { particles = event.data as Petal[]; };
    resize(); window.addEventListener('resize', resize);
    worker.postMessage({ type: 'init', width, height, count: quality === 'high' ? 42 : 23 });
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); worker.terminate(); };
  }, [enabled, quality]);
  return <canvas ref={canvasRef} className="worker-petals" aria-hidden="true" />;
}
