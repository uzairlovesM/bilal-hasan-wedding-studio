import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const animationData = {
  v: '5.12.2', fr: 30, ip: 0, op: 90, w: 240, h: 240,
  nm: 'Golden floral glint', ddd: 0, assets: [],
  layers: [{ ddd: 0, ind: 1, ty: 4, nm: 'Ornamental diamond', sr: 1, ks: {
    o: { a: 0, k: 100 }, r: { a: 1, k: [{ t: 0, s: [0], e: [180], i: { x: [.3], y: [1] }, o: { x: [.7], y: [0] } }, { t: 90, s: [180] }] },
    p: { a: 0, k: [120, 120, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 1, k: [{ t: 0, s: [90, 90, 100], e: [108, 108, 100], i: { x: [.4, .4, .4], y: [1, 1, 1] }, o: { x: [.6, .6, .6], y: [0, 0, 0] } }, { t: 45, s: [108, 108, 100], e: [90, 90, 100], i: { x: [.4, .4, .4], y: [1, 1, 1] }, o: { x: [.6, .6, .6], y: [0, 0, 0] } }, { t: 90, s: [90, 90, 100] }] }
  }, ao: 0, shapes: [{ ty: 'gr', it: [
    { d: 1, ty: 'el', s: { a: 0, k: [28, 28] }, p: { a: 0, k: [0, -41] }, nm: 'Upper petal' },
    { ty: 'fl', c: { a: 0, k: [.75, .55, .23, 1] }, o: { a: 0, k: 95 }, r: 1, nm: 'Gold fill' },
    { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 }, nm: 'Transform' }
  ], nm: 'Floral glint' }], ip: 0, op: 90, st: 0, bm: 0 }]
};

export default function LottieFlourish({ className = '' }: { className?: string }) {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!node.current) return;
    const instance = lottie.loadAnimation({ container: node.current, renderer: 'svg', loop: true, autoplay: true, animationData });
    return () => instance.destroy();
  }, []);
  return <div className={`lottie-flourish ${className}`} ref={node} aria-hidden="true" />;
}
