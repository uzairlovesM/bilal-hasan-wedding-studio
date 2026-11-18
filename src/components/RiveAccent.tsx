import { useEffect, useRef, useState } from 'react';

export default function RiveAccent() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let rive: any;
    let live = true;
    fetch('/assets/wedding-accent.riv', { method: 'HEAD' }).then(async response => {
      if (!live || !response.ok || !canvas.current) return;
      const runtime = await import('@rive-app/canvas');
      if (!live || !canvas.current) return;
      rive = new runtime.Rive({ src: '/assets/wedding-accent.riv', canvas: canvas.current, autoplay: true, onLoad: () => rive?.resizeDrawingSurfaceToCanvas() });
      setAvailable(true);
    }).catch(() => undefined);
    return () => { live = false; rive?.cleanup(); };
  }, []);
  return <canvas ref={canvas} className={`rive-accent ${available ? 'is-active' : ''}`} aria-hidden="true" />;
}
