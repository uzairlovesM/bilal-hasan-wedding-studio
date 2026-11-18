import { NodeIO } from '@gltf-transform/core';
import { prune, dedup, weld, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { mkdir } from 'node:fs/promises';

const input = process.argv[2] || 'public/models/envelope-prop.glb';
const output = process.argv[3] || 'public/models/envelope-optimized.glb';
await MeshoptEncoder.ready;
const io = new NodeIO();
const document = await io.read(input);
await document.transform(prune(), dedup(), weld(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await mkdir(output.slice(0, output.lastIndexOf('/')) || '.', { recursive: true });
await io.write(output, document);
process.stdout.write(`Optimized GLB written to ${output}\n`);
