export type RuntimeCapabilities = {
  webgpu: boolean;
  webgl2: boolean;
  webgl: boolean;
  offscreenCanvas: boolean;
  workers: boolean;
  audioContext: boolean;
  reducedMotion: boolean;
  maxTextureSize: number;
};

export function detectCapabilities(): RuntimeCapabilities {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const result: RuntimeCapabilities = {
    webgpu: 'gpu' in navigator,
    webgl2: !!canvas.getContext('webgl2'),
    webgl: !!gl,
    offscreenCanvas: 'OffscreenCanvas' in window,
    workers: 'Worker' in window,
    audioContext: 'AudioContext' in window || 'webkitAudioContext' in window,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0
  };
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  return result;
}
