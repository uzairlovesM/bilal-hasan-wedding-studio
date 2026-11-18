import * as THREE from 'three';
import { WebGPURenderer, MeshBasicNodeMaterial, RenderPipeline } from 'three/webgpu';
import { color, float, sin, time, pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';
import { gsap } from 'gsap';
import { createWeddingModelLoader } from './modelLoader';
import { goldIridescenceGLSL } from './shaders';
import { createRapierDrop, createCannonDrop, createSpringFallback } from '../physics/dropPhysics';
import { mountCanvasFallback } from './canvasFallback';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { useStudioStore } from '../store';

type DropApi = { step: (delta: number) => any; dispose: () => void };
export type EnvelopeController = { open: () => Promise<void>; replay: () => void; pause: () => void; dispose: () => void };

function createPaperTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 720;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 1024, 720);
  grad.addColorStop(0, '#fff8e9'); grad.addColorStop(.5, '#f3e5c9'); grad.addColorStop(1, '#fffaf1');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 720);
  ctx.strokeStyle = '#b78b48'; ctx.lineWidth = 12; ctx.strokeRect(36, 36, 952, 648);
  ctx.strokeStyle = 'rgba(183,139,72,.35)'; ctx.lineWidth = 3; ctx.strokeRect(57, 57, 910, 606);
  ctx.fillStyle = '#284735'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
  ctx.font = '58px "Noto Naskh Arabic", serif'; ctx.fillText('بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ', 512, 180);
  ctx.fillStyle = '#9d293d'; ctx.font = 'bold 82px "Noto Nastaliq Urdu", serif'; ctx.fillText('دعوت نامہ', 512, 310);
  ctx.fillStyle = '#203c2d'; ctx.font = 'bold 76px "Noto Nastaliq Urdu", serif'; ctx.fillText('بلال حسن', 512, 440);
  ctx.fillStyle = '#7b5c2f'; ctx.font = '42px "Noto Nastaliq Urdu", serif'; ctx.fillText('فرزند ظفر اقبال', 512, 525);
  ctx.font = '34px Georgia, serif'; ctx.fillText('❦  28 • 29 • 30 NOVEMBER 2026  ❦', 512, 612);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


function createEnvelopeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 720;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 1024, 720);
  gradient.addColorStop(0, '#fff6e5'); gradient.addColorStop(.48, '#ead9b7'); gradient.addColorStop(1, '#d8bf91');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 720);
  let seed = 92;
  for (let i = 0; i < 22000; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = seed % 1024;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const y = seed % 720;
    const alpha = ((seed >>> 8) % 14) / 100;
    ctx.fillStyle = `rgba(111,79,39,${alpha})`;
    ctx.fillRect(x, y, 1 + (seed % 2), 1);
  }
  ctx.strokeStyle = 'rgba(151,108,47,.84)'; ctx.lineWidth = 8; ctx.strokeRect(25, 25, 974, 670);
  ctx.strokeStyle = 'rgba(255,250,235,.94)'; ctx.lineWidth = 3; ctx.strokeRect(40, 40, 944, 640);
  ctx.strokeStyle = 'rgba(169,128,67,.64)'; ctx.lineWidth = 2; ctx.strokeRect(58, 58, 908, 604);
  for (let x = 82; x < 955; x += 34) {
    ctx.beginPath(); ctx.moveTo(x, 47); ctx.lineTo(x + 7, 53); ctx.lineTo(x, 59); ctx.lineTo(x - 7, 53); ctx.closePath();
    ctx.fillStyle = 'rgba(150,110,54,.55)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, 661); ctx.lineTo(x + 7, 667); ctx.lineTo(x, 673); ctx.lineTo(x - 7, 667); ctx.closePath(); ctx.fill();
  }
  ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(136,97,46,.5)'; ctx.font = '90px Georgia'; ctx.fillText('❦', 512, 392);
  ctx.font = '30px Georgia'; ctx.fillText('✦     ❧     ✦', 512, 460);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createSealTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(168, 150, 22, 256, 256, 262);
  gradient.addColorStop(0, '#53704a'); gradient.addColorStop(.58, '#254b34'); gradient.addColorStop(1, '#10291d');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#d8b56d'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(256, 256, 220, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(243,220,166,.72)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(256, 256, 194, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#f0d89d'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 250px "Noto Naskh Arabic", serif'; ctx.fillText('ب', 256, 270);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; return texture;
}

function addEnvelopeDetails(root: THREE.Group, model: THREE.Group, flap: THREE.Object3D | null) {
  const paperTexture = createEnvelopeTexture();
  const cardTexture = createPaperTexture();
  const sealTexture = createSealTexture();
  const paper = new THREE.MeshPhysicalMaterial({ map: paperTexture, color: '#fffaf0', roughness: .45, metalness: .035, clearcoat: .38, clearcoatRoughness: .34, sheen: .28, sheenColor: '#e5cfaa' });
  const cardMaterial = new THREE.MeshPhysicalMaterial({ map: cardTexture, color: '#fffdf6', roughness: .55, metalness: .01, clearcoat: .2 });
  const sealMaterial = new THREE.MeshPhysicalMaterial({ color: '#254735', roughness: .25, metalness: .18, clearcoat: 1, clearcoatRoughness: .14 });
  const goldMaterial = new THREE.MeshPhysicalMaterial({ color: '#c5a05e', roughness: .22, metalness: .92, clearcoat: 1 });
  model.traverse(object => {
    if (!(object as THREE.Mesh).isMesh) return;
    const mesh = object as THREE.Mesh;
    mesh.castShadow = true; mesh.receiveShadow = true;
    const name = mesh.name.toLowerCase();
    if (name.includes('envelopebody')) mesh.material = paper;
    if (name.includes('invitationcard')) mesh.material = cardMaterial;
    if (name.includes('envelopeflap')) mesh.material = paper;
    if (name.includes('waxseal')) mesh.material = sealMaterial;
    if (name.includes('sealgoldring')) mesh.material = goldMaterial;
  });
  const line = new THREE.LineBasicMaterial({ color: '#bc914a', transparent: true, opacity: .84 });
  const addLine = (points: THREE.Vector3[]) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    root.add(new THREE.Line(geometry, line));
  };
  const y = .071;
  const trim = [
    [new THREE.Vector3(-1.31, y, -.84), new THREE.Vector3(1.31, y, -.84)],
    [new THREE.Vector3(-1.31, y, .84), new THREE.Vector3(1.31, y, .84)],
    [new THREE.Vector3(-1.31, y, -.84), new THREE.Vector3(-1.31, y, .84)],
    [new THREE.Vector3(1.31, y, -.84), new THREE.Vector3(1.31, y, .84)]
  ];
  trim.forEach(addLine);
  addLine([new THREE.Vector3(-1.34, .074, .93), new THREE.Vector3(0, .075, .02)]);
  addLine([new THREE.Vector3(1.34, .074, .93), new THREE.Vector3(0, .075, .02)]);
  addLine([new THREE.Vector3(-1.34, .074, -.93), new THREE.Vector3(0, .075, .02)]);
  addLine([new THREE.Vector3(1.34, .074, -.93), new THREE.Vector3(0, .075, .02)]);
  for (const x of [-1.24, 1.24]) {
    for (const z of [-.78, .78]) {
      const flower = new THREE.Mesh(new THREE.TorusGeometry(.082, .012, 8, 32), goldMaterial);
      flower.rotation.x = Math.PI / 2; flower.position.set(x, .083, z); root.add(flower);
      const center = new THREE.Mesh(new THREE.SphereGeometry(.027, 12, 12), goldMaterial);
      center.position.set(x, .1, z); root.add(center);
    }
  }
  const monogram = new THREE.Mesh(new THREE.CircleGeometry(.18, 56), new THREE.MeshBasicMaterial({ map: sealTexture, transparent: true, side: THREE.DoubleSide }));
  monogram.rotation.x = -Math.PI / 2; monogram.position.set(0, .22, -.45); root.add(monogram);
  if (flap instanceof THREE.Mesh) {
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(flap.geometry), line);
    flap.add(edge);
  }
}

function makeFlapMaterial(webgpu: boolean) {
  if (webgpu) {
    const material = new MeshBasicNodeMaterial();
    material.colorNode = color('#c8a05d').mul(float(0.88).add(sin(time.mul(1.55)).mul(0.12)));
    return material;
  }
  return new THREE.ShaderMaterial({
    vertexShader: goldIridescenceGLSL.vertex,
    fragmentShader: goldIridescenceGLSL.fragment,
    uniforms: { uTime: { value: 0 }, uGold: { value: new THREE.Color('#c49a55') } },
    transparent: true, side: THREE.DoubleSide, depthWrite: false
  });
}

function createFallbackEnvelope() {
  const root = new THREE.Group();
  const paper = new THREE.MeshPhysicalMaterial({ color: '#f4e7cd', roughness: .56, metalness: .02, clearcoat: .22, clearcoatRoughness: .34 });
  const green = new THREE.MeshPhysicalMaterial({ color: '#244735', roughness: .28, metalness: .2, clearcoat: .8 });
  const gold = new THREE.MeshPhysicalMaterial({ color: '#bd9550', metalness: .83, roughness: .22, clearcoat: 1 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.78, .12, 1.9), paper);
  base.name = 'EnvelopeBody'; root.add(base);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.55), new THREE.MeshBasicMaterial({ map: createPaperTexture(), side: THREE.DoubleSide }));
  card.rotation.x = -Math.PI / 2; card.position.set(0, .105, .04); card.name = 'InvitationCard'; root.add(card);
  const foldShape = new THREE.Shape(); foldShape.moveTo(-1.38, -.95); foldShape.lineTo(1.38, -.95); foldShape.lineTo(0, .08); foldShape.closePath();
  const flapGeometry = new THREE.ShapeGeometry(foldShape);
  const flap = new THREE.Mesh(flapGeometry, paper);
  flap.rotation.x = -Math.PI / 2; flap.position.set(0, .16, 0); flap.name = 'EnvelopeFlap'; root.add(flap);
  const flapGold = new THREE.LineSegments(new THREE.EdgesGeometry(flapGeometry), new THREE.LineBasicMaterial({ color: '#b58b48' }));
  flapGold.rotation.copy(flap.rotation); flapGold.position.copy(flap.position); root.add(flapGold);
  const medallion = new THREE.Mesh(new THREE.CylinderGeometry(.29, .31, .11, 48), green);
  medallion.name = 'WaxSeal'; medallion.position.set(0, .24, -.42); medallion.name = 'WaxSeal'; root.add(medallion);
  const medallionRing = new THREE.Mesh(new THREE.TorusGeometry(.235, .025, 12, 56), gold);
  medallionRing.name = 'SealGoldRing'; medallionRing.rotation.x = Math.PI / 2; medallionRing.position.set(0, .3, -.42); root.add(medallionRing);
  return root;
}

export async function mountEnvelopeScene(host: HTMLDivElement, onSettled: () => void, onOpened: () => void): Promise<EnvelopeController> {
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2('#ead9b8', .035);
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 80);
  camera.position.set(0, 4.9, 7.2); camera.lookAt(0, .12, 0);
  let renderer: any;
  let isWebGPU = false;
  const preferred = useStudioStore.getState().engine;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, useStudioStore.getState().quality === 'high' ? 2 : 1.35);
  if (preferred === 'canvas') return mountCanvasFallback(host, onSettled, onOpened);
  try {
    if (preferred !== 'webgl' && 'gpu' in navigator) {
      renderer = new WebGPURenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      await renderer.init();
      isWebGPU = true;
    } else {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    }
  } catch {
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      isWebGPU = false;
    } catch {
      return mountCanvasFallback(host, onSettled, onOpened);
    }
  }
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(host.clientWidth || 640, host.clientHeight || 420);
  if (renderer.shadowMap) renderer.shadowMap.enabled = !isWebGPU;
  if (renderer.outputColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.className = 'envelope-canvas';

  scene.add(new THREE.HemisphereLight('#fff2d9', '#765a37', 2.1));
  const key = new THREE.DirectionalLight('#fff0d0', 3.4); key.position.set(-3, 7, 5); key.castShadow = !isWebGPU; scene.add(key);
  const rim = new THREE.PointLight('#e4b96c', 135, 13); rim.position.set(3, 2.3, -2); scene.add(rim);
  const pink = new THREE.PointLight('#f3b9a8', 68, 9); pink.position.set(-3, 1.4, 2); scene.add(pink);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshPhysicalMaterial({ color: '#cbb998', roughness: .32, metalness: .08, clearcoat: .42 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.16; ground.receiveShadow = true; scene.add(ground);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(2.5, 72), new THREE.MeshBasicMaterial({ color: '#d7b66f', transparent: true, opacity: .12, depthWrite: false }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = -.145; scene.add(halo);

  const root = new THREE.Group(); root.position.set(0, 2.7, 0); root.rotation.set(.06, -.06, -.1); scene.add(root);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.55, 64), new THREE.MeshBasicMaterial({ color: '#4c3824', transparent: true, opacity: .28, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1, .7, 1); shadow.position.y = -.145; scene.add(shadow);

  let flap: THREE.Object3D | null | undefined = null;
  let card: THREE.Object3D | null | undefined = null;
  let seal: THREE.Object3D | null | undefined = null;
  const useModel = async () => {
    try {
      const { loader } = createWeddingModelLoader(isWebGPU ? undefined : renderer);
      const gltf = await loader.loadAsync('/models/envelope-prop.glb');
      root.clear();
      gltf.scene.scale.setScalar(1);
      root.add(gltf.scene);
      flap = gltf.scene.getObjectByName('EnvelopeFlap') ?? gltf.scene.getObjectByName('envelope_flap') ?? null;
      if (flap instanceof THREE.Mesh) { flap.geometry.translate(0, 0, .94); flap.position.z = -.94; }
      card = gltf.scene.getObjectByName('InvitationCard') ?? gltf.scene.getObjectByName('invitation_card') ?? null;
      seal = gltf.scene.getObjectByName('WaxSeal') ?? gltf.scene.getObjectByName('wax_seal') ?? null;
      if (!flap || !card || !seal) {
        root.clear();
        const fallback = createFallbackEnvelope(); root.add(fallback);
        flap = fallback.getObjectByName('EnvelopeFlap'); card = fallback.getObjectByName('InvitationCard'); seal = fallback.getObjectByName('WaxSeal');
      }
    } catch {
      const fallback = createFallbackEnvelope(); root.add(fallback);
      flap = fallback.getObjectByName('EnvelopeFlap'); card = fallback.getObjectByName('InvitationCard'); seal = fallback.getObjectByName('WaxSeal');
    }
  };
  await useModel();
  const flapObj = flap as THREE.Object3D | null | undefined;
  const cardObj = card as THREE.Object3D | null | undefined;
  addEnvelopeDetails(root, root, flapObj ?? null);
  const flapBasePosition = flapObj ? flapObj.position.clone() : new THREE.Vector3();
  const flapBaseRotation = flapObj ? flapObj.rotation.clone() : new THREE.Euler();
  const cardBasePosition = cardObj ? cardObj.position.clone() : new THREE.Vector3(0, .095, 0);
  const cardBaseRotation = cardObj ? cardObj.rotation.clone() : new THREE.Euler();
  const shimmer = new THREE.Mesh(new THREE.PlaneGeometry(1.22, .7), makeFlapMaterial(isWebGPU));
  shimmer.rotation.x = -Math.PI / 2; shimmer.position.set(0, .25, -.42); shimmer.renderOrder = 3; root.add(shimmer);

  try {
    if (!isWebGPU) {
      const pmrem = new PMREMGenerator(renderer);
      new RGBELoader().load('/hdri/wedding-studio.hdr', texture => {
        const env = pmrem.fromEquirectangular(texture);
        scene.environment = env.texture;
        texture.dispose();
        pmrem.dispose();
      });
    }
  } catch {}

  const sparkleCount = 170;
  const positions = new Float32Array(sparkleCount * 3);
  const velocities = new Float32Array(sparkleCount * 3);
  for (let i = 0; i < sparkleCount; i++) {
    positions[i * 3] = (Math.random() - .5) * 8;
    positions[i * 3 + 1] = Math.random() * 4;
    positions[i * 3 + 2] = (Math.random() - .5) * 5;
    velocities[i * 3] = (Math.random() - .5) * .12;
    velocities[i * 3 + 1] = Math.random() * .3 + .04;
    velocities[i * 3 + 2] = (Math.random() - .5) * .12;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: '#f4d58e', size: .026, transparent: true, opacity: .82, sizeAttenuation: true }));
  scene.add(dust);

  let drop: DropApi | null = null;
  let springCancel: (() => void) | null = null;
  let settled = false;
  let opened = false;
  let paused = false;
  let last = performance.now();
  let frame = 0;
  const startFallback = () => {
    springCancel?.();
    springCancel = createSpringFallback(pose => {
      root.position.set(pose.x, pose.y, pose.z); root.rotation.z = pose.rz;
    }, () => { settled = true; onSettled(); });
  };
  try {
    drop = await createRapierDrop();
  } catch {
    try { drop = await createCannonDrop(); } catch { startFallback(); }
  }

  let composer: EffectComposer | null = null;
  let renderPipeline: RenderPipeline | null = null;
  if (isWebGPU) {
    try {
      renderPipeline = new RenderPipeline(renderer);
      const scenePass = pass(scene, camera);
      const sceneColor = scenePass.getTextureNode('output');
      const bloomNode = bloom(sceneColor);
      bloomNode.threshold.value = .68;
      bloomNode.strength.value = .46;
      bloomNode.radius.value = .32;
      renderPipeline.outputNode = sceneColor.add(bloomNode);
    } catch { renderPipeline = null; }
  }
  if (!isWebGPU) {
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(host.clientWidth || 640, host.clientHeight || 420), .42, .55, .82));
    } catch { composer = null; }
  }
  const resize = () => {
    const w = Math.max(1, host.clientWidth); const h = Math.max(1, host.clientHeight);
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); composer?.setSize(w, h);
  };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
  const render = (now: number) => {
    if (paused) return;
    frame = requestAnimationFrame(render);
    const delta = Math.min((now - last) / 1000, .032); last = now;
    if (drop && !settled) {
      const pose = drop.step(delta);
      if (pose) {
        root.position.set(pose.x, pose.y, pose.z);
        root.rotation.set(pose.rx, pose.ry, pose.rz);
        shadow.scale.setScalar(THREE.MathUtils.clamp(1.5 - pose.y * .1, 1.05, 1.6));
        const v = Math.abs(pose.y - .12);
        shadow.material.opacity = THREE.MathUtils.clamp(.35 - v * .1, .07, .32);
        if (pose.y < .2 && (pose.speed < .22 && pose.angularSpeed < .7 && now > startTime + 900 || now > startTime + 3200)) {
          settled = true; root.position.y = .1; root.rotation.set(0, 0, 0); onSettled();
        }
      }
    }
    if (!isWebGPU) {
      root.traverse(obj => {
        const material = (obj as THREE.Mesh).material as any;
        if (material?.uniforms?.uTime) material.uniforms.uTime.value = now / 1000;
      });
    }
    const attr = dustGeometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < sparkleCount; i++) {
      const ix = i * 3;
      positions[ix] += velocities[ix] * delta;
      positions[ix + 1] += velocities[ix + 1] * delta;
      positions[ix + 2] += velocities[ix + 2] * delta;
      if (positions[ix + 1] > 4.2) positions[ix + 1] = -.1;
      if (Math.abs(positions[ix]) > 4.5) velocities[ix] *= -1;
    }
    attr.needsUpdate = true;
    dust.rotation.y += delta * .018;
    if (useStudioStore.getState().motionEnabled) halo.material.opacity = .1 + Math.sin(now * .0007) * .035;
    if (renderPipeline) renderPipeline.render();
    else if (composer) composer.render(delta);
    else renderer.render(scene, camera);
  };
  const startTime = performance.now();
  frame = requestAnimationFrame(render);

  const burst = () => {
    for (let i = 0; i < 48; i++) {
      const particle = new THREE.Mesh(new THREE.SphereGeometry(.018 + Math.random() * .018, 6, 6), new THREE.MeshBasicMaterial({ color: i % 3 ? '#e5be6d' : '#f8dfaa' }));
      particle.position.set((Math.random() - .5) * .35, .55, -.42 + (Math.random() - .5) * .25); root.add(particle);
      gsap.to(particle.position, { x: particle.position.x + (Math.random() - .5) * 2.5, y: particle.position.y + Math.random() * 1.8, z: particle.position.z + (Math.random() - .5) * 1.5, duration: .9 + Math.random() * .6, ease: 'power2.out' });
      gsap.to(particle.material, { opacity: 0, duration: 1.1, delay: .15, onComplete: () => { root.remove(particle); particle.geometry.dispose(); (particle.material as THREE.Material).dispose(); } });
    }
  };
  const open = async () => {
    if (opened) return;
    opened = true;
    if (drop) { drop.dispose(); drop = null; }
    const tl = gsap.timeline();
    if (seal) {
      tl.to(seal.scale, { x: 1.22, y: 1.22, z: 1.22, duration: .16, ease: 'back.out(3)' })
        .to(seal.scale, { x: .01, y: .01, z: .01, duration: .24, ease: 'back.in(2)', onStart: burst }, '+=.03');
    } else tl.call(burst);
    if (flap) {
      tl.to(flap.rotation, { x: -Math.PI * .9, duration: 1.05, ease: 'power3.inOut' }, '-=.06');
      tl.to(flap.position, { y: flapBasePosition.y + .08, duration: .58, ease: 'sine.out' }, '<');
    }
    if (card) {
      tl.fromTo(card.position, { y: card.position.y }, { y: card.position.y + .52, duration: 1.2, ease: 'power3.out' }, '-=.45');
      tl.to(card.rotation, { x: -.16, duration: .8, ease: 'power2.out' }, '<');
    }
    tl.to(camera.position, { x: 0, y: 5.6, z: 6.1, duration: 1.3, ease: 'power2.inOut' }, '-=1.05');
    tl.to(root.rotation, { z: .015, duration: .8, ease: 'power2.out' }, '<');
    tl.to(root.scale, { x: 1.04, y: 1.04, z: 1.04, duration: .65, ease: 'power2.out' }, '<');
    return new Promise<void>(resolve => { tl.eventCallback('onComplete', () => { onOpened(); resolve(); }); });
  };
  const replay = () => {
    opened = false; settled = false;
    drop?.dispose(); drop = null;
    gsap.killTweensOf(root); if (flap) gsap.killTweensOf(flap.rotation); if (card) gsap.killTweensOf(card.position); if (seal) gsap.killTweensOf(seal.scale);
    root.position.set(0, 2.7, 0); root.rotation.set(.06, -.06, -.1); root.scale.setScalar(1);
    camera.position.set(0, 4.9, 7.2); camera.lookAt(0, .12, 0);
    if (flap) { flap.position.copy(flapBasePosition); flap.rotation.copy(flapBaseRotation); }
    if (card) { card.position.copy(cardBasePosition); card.rotation.copy(cardBaseRotation); }
    if (seal) seal.scale.setScalar(1);
    onSettled();
    startFallback();
  };
  return {
    open,
    replay,
    pause() { paused = !paused; if (paused) cancelAnimationFrame(frame); else { last = performance.now(); frame = requestAnimationFrame(render); } },
    dispose() { cancelAnimationFrame(frame); springCancel?.(); drop?.dispose(); resizeObserver.disconnect(); renderer.dispose(); host.removeChild(renderer.domElement); dustGeometry.dispose(); (dust.material as THREE.Material).dispose(); }
  };
}
