import gsap from 'gsap';

type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; speed: number; angularSpeed: number };
type DropController = { step: (delta: number) => Pose | null; dispose: () => void };

export async function createRapierDrop(): Promise<DropController> {
  const module = await import('@dimforge/rapier3d-compat');
  const RAPIER: any = (module as any).default ?? module;
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: -10.8, z: 0 });
  world.timestep = 1 / 60;
  const floor = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.15, 0));
  world.createCollider(RAPIER.ColliderDesc.cuboid(8, 0.1, 8).setFriction(0.88), floor);
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(0, 2.7, 0)
    .setRotation({ x: 0.08, y: -0.09, z: 0.03, w: 0.992 })
    .setLinearDamping(0.72)
    .setAngularDamping(3.1)
    .setCanSleep(true);
  const body = world.createRigidBody(bodyDesc);
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(1.43, 0.09, 0.96)
      .setRestitution(0.19)
      .setFriction(0.82)
      .setDensity(0.48),
    body
  );
  let accumulator = 0;
  return {
    step(delta) {
      accumulator += Math.min(delta, 0.033);
      const fixed = 1 / 60;
      let loops = 0;
      while (accumulator >= fixed && loops < 3) {
        world.step();
        accumulator -= fixed;
        loops += 1;
      }
      const p = body.translation();
      const q = body.rotation();
      const v = body.linvel();
      const w = body.angvel();
      return {
        x: p.x, y: p.y, z: p.z,
        rx: Math.atan2(2 * (q.w * q.x + q.y * q.z), 1 - 2 * (q.x * q.x + q.y * q.y)),
        ry: Math.atan2(2 * (q.w * q.y - q.z * q.x), 1 - 2 * (q.y * q.y + q.z * q.z)),
        rz: Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.z * q.z + q.x * q.x)),
        speed: Math.hypot(v.x, v.y, v.z), angularSpeed: Math.hypot(w.x, w.y, w.z)
      };
    },
    dispose() { world.free(); }
  };
}

export async function createCannonDrop(): Promise<DropController> {
  const CANNON = await import('cannon-es');
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -10.8, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;
  const floor = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(floor);
  const body = new CANNON.Body({ mass: 1.2, shape: new CANNON.Box(new CANNON.Vec3(1.43, 0.09, 0.96)), linearDamping: 0.72, angularDamping: 0.83 });
  body.position.set(0, 2.7, 0);
  body.quaternion.setFromEuler(0.08, -0.09, 0.03);
  body.material = new CANNON.Material({ friction: 0.82, restitution: 0.19 });
  world.addBody(body);
  const euler = new CANNON.Vec3();
  return {
    step(delta) {
      world.step(1 / 60, Math.min(delta, 0.033), 3);
      const velocity = body.velocity; const angular = body.angularVelocity;
      body.quaternion.toEuler(euler);
      return { x: body.position.x, y: body.position.y, z: body.position.z, rx: euler.x, ry: euler.y, rz: euler.z, speed: velocity.length(), angularSpeed: angular.length() };
    },
    dispose() { world.bodies.slice().forEach(b => world.removeBody(b)); }
  };
}

export function createSpringFallback(onUpdate: (pose: Pose) => void, onComplete: () => void) {
  const state = { y: 2.65, velocity: 0, rotation: -0.16, rotationVelocity: 0 };
  const target = { y: 0.16, rotation: 0 };
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const dt = Math.min((now - (tick as any).last || 16) / 1000, 0.032);
    (tick as any).last = now;
    const spring = 105;
    state.velocity += ((target.y - state.y) * spring - state.velocity * 12.5) * dt;
    state.rotationVelocity += ((target.rotation - state.rotation) * 70 - state.rotationVelocity * 11) * dt;
    state.y += state.velocity * dt;
    state.rotation += state.rotationVelocity * dt;
    onUpdate({ x: 0, y: state.y, z: 0, rx: 0, ry: 0, rz: state.rotation, speed: Math.abs(state.velocity), angularSpeed: Math.abs(state.rotationVelocity) });
    if (now - start < 2150 || Math.abs(state.velocity) > 0.08) raf = requestAnimationFrame(tick);
    else onComplete();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export function animateSpring(target: object, properties: object, duration = 0.7) {
  return gsap.to(target, { ...properties, duration, ease: 'elastic.out(1, 0.52)' });
}
