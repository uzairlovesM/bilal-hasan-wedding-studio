type Petal = { x: number; y: number; vx: number; vy: number; spin: number; angle: number; size: number };
type WorkerMessage = { type: 'init' | 'tick' | 'resize' | 'pause'; width?: number; height?: number; delta?: number; count?: number; active?: boolean };
let petals: Petal[] = [];
let width = 1;
let height = 1;
let active = true;

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const data = event.data;
  if (data.type === 'init') {
    width = Math.max(1, data.width || 1); height = Math.max(1, data.height || 1);
    const count = Math.max(8, Math.min(160, data.count || 40));
    petals = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .65, vy: .3 + Math.random() * .9, spin: (Math.random() - .5) * .028, angle: Math.random() * Math.PI * 2, size: 4 + Math.random() * 9 }));
  } else if (data.type === 'resize') {
    width = Math.max(1, data.width || width); height = Math.max(1, data.height || height);
  } else if (data.type === 'pause') active = data.active !== false;
  else if (data.type === 'tick' && active) {
    const dt = Math.min(.034, Math.max(.001, data.delta || .016));
    for (const p of petals) {
      p.x += (p.vx + Math.sin(p.y * .006 + p.angle) * .35) * dt * 60;
      p.y += p.vy * dt * 60;
      p.angle += p.spin * dt * 60;
      if (p.y > height + p.size) { p.y = -p.size; p.x = Math.random() * width; }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
    }
    (self as DedicatedWorkerGlobalScope).postMessage(petals);
  }
};
