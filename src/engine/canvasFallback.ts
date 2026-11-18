import gsap from 'gsap';

export function mountCanvasFallback(host: HTMLDivElement, onSettled: () => void, onOpened: () => void) {
  const canvas = document.createElement('canvas');
  canvas.className = 'envelope-canvas canvas-fallback';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is unavailable');
  let width = 1; let height = 1; let dpr = 1; let time = 0; let opened = false; let y = -1.6; let velocity = 0; let settled = false; let raf = 0; let physicsRaf = 0; let paused = false;
  const resize = () => { width = host.clientWidth || 1; height = host.clientHeight || 1; dpr = Math.min(devicePixelRatio || 1, 1.5); canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const draw = () => {
    if (paused) return;
    const w = width; const h = height; ctx.clearRect(0, 0, w, h);
    const cx = w / 2; const cy = h * .56 + y * h * .13; const scale = Math.min(w / 490, h / 300) * .9;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(24,15,8,.22)'; ctx.filter = 'blur(18px)'; ctx.beginPath(); ctx.ellipse(0, 70, 170, 27, 0, 0, Math.PI * 2); ctx.fill(); ctx.filter = 'none';
    const body = ctx.createLinearGradient(-150, -50, 150, 70); body.addColorStop(0, '#fff5df'); body.addColorStop(.48, '#e8d3ae'); body.addColorStop(1, '#c6a36a');
    ctx.fillStyle = body; ctx.beginPath(); ctx.roundRect(-160, -54, 320, 128, 13); ctx.fill();
    ctx.strokeStyle = '#b58b4b'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(153,112,53,.45)'; ctx.lineWidth = 1; ctx.strokeRect(-146, -42, 292, 105);
    ctx.fillStyle = 'rgba(255,255,245,.7)'; ctx.beginPath(); ctx.moveTo(-158, -54); ctx.lineTo(0, 17); ctx.lineTo(158, -54); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-160, 73); ctx.lineTo(0, -5); ctx.lineTo(160, 73); ctx.fillStyle = '#d7bd8e'; ctx.fill();
    ctx.save(); ctx.translate(0, -54); ctx.rotate(opened ? -Math.PI * .78 : 0); ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(160, 0); ctx.lineTo(0, 108); ctx.closePath();
    const flap = ctx.createLinearGradient(-120, 0, 120, 100); flap.addColorStop(0, '#fff6e1'); flap.addColorStop(.55, '#d9bf8f'); flap.addColorStop(1, '#ad8145'); ctx.fillStyle = flap; ctx.fill(); ctx.strokeStyle = '#b58b4b'; ctx.stroke(); ctx.restore();
    if (opened) {
      ctx.save(); ctx.translate(0, -48); ctx.fillStyle = '#fff7e9'; ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 18; ctx.fillRect(-129, -175, 258, 180); ctx.shadowBlur = 0; ctx.strokeStyle = '#b58b4b'; ctx.strokeRect(-119, -165, 238, 160);
      ctx.fillStyle = '#244331'; ctx.textAlign = 'center'; ctx.font = 'bold 30px serif'; ctx.fillText('دعوت نامہ', 0, -112); ctx.font = '26px serif'; ctx.fillText('بلال حسن', 0, -70); ctx.font = '15px serif'; ctx.fillText('فرزند ظفر اقبال', 0, -38); ctx.restore();
    } else {
      ctx.fillStyle = '#244735'; ctx.beginPath(); ctx.arc(0, 10, 24, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#d9b56f'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#f4dca4'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '24px serif'; ctx.fillText('ب', 0, 11);
    }
    ctx.restore();
    raf = requestAnimationFrame(draw);
  };
  resize(); const observer = new ResizeObserver(resize); observer.observe(host);
  const start = performance.now(); let previous = start;
  const physicsTick = (now: number) => {
    if (!settled) {
      const dt = Math.min(.032, (now - previous) / 1000); previous = now;
      velocity += (-9.6 - velocity * 2.5) * dt; y += velocity * dt;
      if (y <= .03) { y = .03; velocity *= -.22; if (Math.abs(velocity) < .45 || now - start > 2300) { settled = true; onSettled(); } }
      else if (now - start > 3000) { settled = true; y = .03; onSettled(); }
    }
    if (!paused) physicsRaf = requestAnimationFrame(physicsTick);
  };
  physicsRaf = requestAnimationFrame(physicsTick); raf = requestAnimationFrame(draw);
  return {
    open: () => new Promise<void>(resolve => {
      if (opened) { resolve(); return; } opened = true;
      gsap.fromTo({ value: 0 }, { value: 1 }, { duration: 1.45, ease: 'power3.out', onComplete: () => { onOpened(); resolve(); } });
    }),
    replay: () => { cancelAnimationFrame(physicsRaf); opened = false; settled = false; y = -1.6; velocity = 0; previous = performance.now(); physicsRaf = requestAnimationFrame(physicsTick); },
    pause: () => { paused = !paused; if (paused) cancelAnimationFrame(physicsRaf); else { raf = requestAnimationFrame(draw); physicsRaf = requestAnimationFrame(physicsTick); } },
    dispose: () => { cancelAnimationFrame(raf); cancelAnimationFrame(physicsRaf); observer.disconnect(); canvas.remove(); }
  };
}
