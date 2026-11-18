import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const pairs = [
  ['node_modules/three/examples/jsm/libs/draco/gltf', 'public/decoders/draco'],
  ['node_modules/three/examples/jsm/libs/basis', 'public/decoders/basis']
];
for (const [source, destination] of pairs) {
  if (!existsSync(source)) continue;
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}
