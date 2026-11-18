export const goldIridescenceGLSL = {
  vertex: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mvPosition.xyz);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragment: `
    precision highp float;
    uniform float uTime;
    uniform vec3 uGold;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vView;
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), f.x), mix(hash(i + vec2(0.0,1.0)), hash(i + 1.0), f.x), f.y);
    }
    void main() {
      float n = noise(vUv * 38.0 + uTime * 0.12);
      float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.25);
      float ribbon = smoothstep(0.72, 0.98, sin(vUv.x * 13.0 - uTime * 1.7 + n * 2.5));
      float glint = smoothstep(0.93, 1.0, sin(vUv.x * 44.0 + vUv.y * 27.0 + uTime * 2.6 + n));
      vec3 color = uGold * (0.56 + n * 0.12 + fresnel * 0.78 + ribbon * 0.15) + vec3(1.0,0.82,0.49) * glint * 0.48;
      gl_FragColor = vec4(color, 0.42 + fresnel * 0.28 + glint * 0.2);
    }
  `
};

export const goldIridescenceWGSL = `
struct Uniforms { time: f32, intensity: f32, }
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
fn hash(p: vec2<f32>) -> f32 { return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453); }
fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p); let f = fract(p); let u = f * f * (vec2<f32>(3.0) - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2<f32>(1.0, 0.0)), u.x), mix(hash(i + vec2<f32>(0.0, 1.0)), hash(i + vec2<f32>(1.0, 1.0)), u.x), u.y);
}
@fragment fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let grain = noise(uv * 32.0 + uniforms.time * 0.12);
  let sweep = smoothstep(0.7, 0.98, sin(uv.x * 14.0 - uniforms.time * 1.8 + grain * 2.0));
  let gold = vec3<f32>(0.78, 0.56, 0.24) * (0.62 + grain * 0.12 + sweep * 0.28);
  return vec4<f32>(gold, uniforms.intensity);
}
`;

export const tslNotes = {
  material: 'MeshBasicNodeMaterial',
  nodes: ['uv', 'time', 'sin', 'snoise', 'mix', 'smoothstep'],
  purpose: 'WebGPU-compatible procedural gold shimmer and noise.'
};
