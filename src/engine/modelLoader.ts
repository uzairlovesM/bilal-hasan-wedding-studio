import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import type { WebGLRenderer } from 'three';

export function createWeddingModelLoader(renderer?: WebGLRenderer) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const draco = new DRACOLoader();
  draco.setDecoderPath('/decoders/draco/');
  loader.setDRACOLoader(draco);
  if (renderer) {
    const ktx2 = new KTX2Loader();
    ktx2.setTranscoderPath('/decoders/basis/');
    ktx2.detectSupport(renderer);
    loader.setKTX2Loader(ktx2);
  }
  return { loader, draco };
}
