export async function mountBabylonAlternative(canvas: HTMLCanvasElement) {
  const B = await import('@babylonjs/core');
  const engine = new B.Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: true });
  const scene = new B.Scene(engine);
  scene.clearColor = new B.Color4(0, 0, 0, 0);
  const camera = new B.ArcRotateCamera('ceremonyCamera', -Math.PI / 2, 1.12, 5.4, B.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  new B.HemisphericLight('ivoryLight', new B.Vector3(0, 1, 0), scene).intensity = 1.25;
  const gold = new B.PointLight('goldLight', new B.Vector3(-2, 2, -1), scene);
  gold.diffuse = new B.Color3(.96, .72, .36); gold.intensity = 38;
  const envelope = B.MeshBuilder.CreateBox('alternateEnvelope', { width: 2.7, height: .12, depth: 1.85 }, scene);
  const paper = new B.StandardMaterial('ivoryPbr', scene);
  paper.diffuseColor = new B.Color3(.9, .82, .65); paper.specularColor = new B.Color3(.62, .5, .28); paper.alpha = 1;
  envelope.material = paper;
  engine.runRenderLoop(() => scene.render());
  return () => { engine.stopRenderLoop(); scene.dispose(); engine.dispose(); };
}
