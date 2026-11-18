import { useEffect, useRef } from 'react';
import { Application, Graphics } from 'pixi.js';
import Matter from 'matter-js';
import { useStudioStore } from '../store';

export default function PixiAtmosphere() {
  const hostRef = useRef<HTMLDivElement>(null);
  const motionEnabled = useStudioStore(s => s.motionEnabled);
  const quality = useStudioStore(s => s.quality);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !motionEnabled) return;
    let app: Application | null = null;
    let disposed = false;
    const particles: Array<{ body: Matter.Body; display: Graphics; speed: number }> = [];
    const engine = Matter.Engine.create({ enableSleeping: true, gravity: { x: 0, y: .002, scale: .001 } });
    const width = () => host.clientWidth || window.innerWidth;
    const height = () => host.clientHeight || window.innerHeight;

    const boot = async () => {
      try {
        app = new Application();
        await app.init({ resizeTo: host, backgroundAlpha: 0, antialias: true, preference: 'webgl', resolution: Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.7 : 1.15), autoDensity: true });
        if (disposed) { app.destroy(); return; }
        app.canvas.className = 'pixi-atmosphere';
        host.appendChild(app.canvas);
        const count = quality === 'high' ? 46 : 24;
        for (let i = 0; i < count; i++) {
          const body = Matter.Bodies.circle(Math.random() * width(), Math.random() * height(), 3 + Math.random() * 4, { frictionAir: .018, restitution: .48, density: .00006 });
          Matter.Body.setVelocity(body, { x: (Math.random() - .5) * .8, y: .2 + Math.random() * .9 });
          Matter.Composite.add(engine.world, body);
          const display = new Graphics().ellipse(0, 0, 4 + Math.random() * 3, 7 + Math.random() * 4).fill({ color: [0xe8c77f, 0xd58d91, 0xf5e6be][i % 3], alpha: .62 });
          display.pivot.set(0, 0);
          app.stage.addChild(display);
          particles.push({ body, display, speed: .35 + Math.random() * .8 });
        }
        app.ticker.add(ticker => {
          const dt = Math.min(ticker.deltaMS, 33);
          Matter.Engine.update(engine, dt);
          const w = width(); const h = height();
          for (const particle of particles) {
            const { body, display, speed } = particle;
            if (body.position.y > h + 25) Matter.Body.setPosition(body, { x: Math.random() * w, y: -20 });
            Matter.Body.applyForce(body, body.position, { x: Math.sin(ticker.lastTime * .0004 + body.id) * .0000009 * speed, y: .0000005 * speed });
            display.position.set(body.position.x, body.position.y);
            display.rotation = body.angle + Math.sin(ticker.lastTime * .001 + body.id) * .3;
            display.alpha = .36 + (Math.sin(ticker.lastTime * .0016 + body.id) + 1) * .22;
          }
        });
      } catch {
        host.classList.add('atmosphere-css-fallback');
      }
    };
    boot();
    return () => {
      disposed = true;
      if (app) { app.stop(); app.destroy(); app.canvas.remove(); }
      particles.length = 0; Matter.Composite.clear(engine.world, false); Matter.Engine.clear(engine);
    };
  }, [motionEnabled, quality]);

  return <div className="pixi-host" ref={hostRef} aria-hidden="true" />;
}
