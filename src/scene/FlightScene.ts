import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { models } from '../lib/assets';

export type CameraView = { pos: [number, number, number]; target: [number, number, number]; via?: [number, number, number] };
export type Finish = { color: string; metalness: number; roughness: number };
const pearl: Finish = { color: '#e9ecef', metalness: .35, roughness: .32 };
const ease = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const v3 = (v: [number, number, number]) => new THREE.Vector3(...v);
type Move = { started: number; duration: number; from: THREE.Vector3; to: THREE.Vector3; via: THREE.Vector3; lookFrom: THREE.Vector3; lookTo: THREE.Vector3 };

function roomEnvironment(renderer: THREE.WebGLRenderer) {
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.SphereGeometry(40, 24, 16), new THREE.MeshBasicMaterial({ color: '#07090c', side: THREE.BackSide })));
  const panel = (color: string, position: [number, number, number], scale: [number, number, number], rotation: [number, number, number]) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    mesh.position.set(...position); mesh.scale.set(...scale); mesh.rotation.set(...rotation); room.add(mesh);
  };
  panel('#dfe8f2', [0, 11, 0], [24, 4, 1], [-Math.PI / 2, 0, 0]);
  panel('#6f86a3', [-14, 1, 2], [16, 4, 1], [0, Math.PI / 2, 0]);
  panel('#3b4a5e', [14, 2, -3], [17, 5, 1], [0, -Math.PI / 2, 0]);
  panel('#1a1f26', [0, -10, 0], [25, 7, 1], [Math.PI / 2, 0, 0]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(room, .03);
  pmrem.dispose();
  disposeObject(room);
  return target;
}

function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  root.traverse(obj => {
    if (!(obj instanceof THREE.Mesh)) return;
    geometries.add(obj.geometry);
    for (const material of Array.isArray(obj.material) ? obj.material : [obj.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
  textures.forEach(texture => texture.dispose());
}

let atlasCanvas: HTMLCanvasElement | undefined;
function cloudAtlas() {
  if (atlasCanvas) return new THREE.CanvasTexture(atlasCanvas);
  const size = 256;
  atlasCanvas = document.createElement('canvas'); atlasCanvas.width = size * 5; atlasCanvas.height = size;
  const ctx = atlasCanvas.getContext('2d')!;
  // Calculate lattice noise once; pixel sampling only interpolates cached values.
  for (let seed = 1; seed <= 5; seed++) {
    const image = ctx.createImageData(size, size);
    const grids = [4, 8, 16, 32, 64].map(frequency => {
      const grid = new Float32Array((frequency + 1) ** 2);
      for (let i = 0; i < grid.length; i++) { const n = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; grid[i] = n - Math.floor(n); }
      return { frequency, grid };
    });
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const nx = (x - size / 2) / (size * .48), ny = (y - size / 2) / (size * .42);
      const ellipse = Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny));
      let n = 0, amp = .5;
      for (const { frequency, grid } of grids) {
        const gx = x / size * frequency, gy = y / size * frequency;
        const ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), stride = frequency + 1;
        const a = grid[iy * stride + ix], b = grid[iy * stride + ix + 1];
        const c = grid[(iy + 1) * stride + ix], d = grid[(iy + 1) * stride + ix + 1];
        n += (a + (b - a) * sx + (c + (d - c) * sx - a - (b - a) * sx) * sy) * amp;
        amp *= .5;
      }
      const i = (y * size + x) * 4, light = 186 + (1 - y / size) * 36;
      image.data[i] = light; image.data[i + 1] = light + 5; image.data[i + 2] = light + 13;
      image.data[i + 3] = Math.round(Math.min(1, Math.pow(ellipse * (n / .96875 * 1.65 + .2), 1.4) * .9) * 255);
    }
    ctx.putImageData(image, (seed - 1) * size, 0);
  }
  return new THREE.CanvasTexture(atlasCanvas);
}

function cloudBatch() {
  const plane = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setIndex(plane.index); geometry.setAttribute('position', plane.getAttribute('position')); geometry.setAttribute('uv', plane.getAttribute('uv'));
  geometry.instanceCount = 220;
  const centers: number[] = [], scales: number[] = [], opacity: number[] = [], tiles: number[] = [];
  const rand = (n: number) => { const x = Math.sin(n * 193.371) * 47453.545; return x - Math.floor(x); };
  for (let i = 0; i < 220; i++) {
    const deck = i >= 150, side = rand(i + 5) < .5 ? -1 : 1;
    const scale = (deck ? 14 : 8) + rand(i + 39) * (deck ? 20 : 16);
    centers.push(deck ? (rand(i + 12) - .5) * 100 : side * (7 + rand(i + 14) * 28), deck ? -9 - rand(i + 23) * 6 : (rand(i + 29) - .5) * 29, rand(i + 31) * 160);
    scales.push(scale, scale * (.45 + rand(i + 51) * .35)); opacity.push(.32 + rand(i + 43) * .4); tiles.push(i % 5);
  }
  geometry.setAttribute('cloudCenter', new THREE.InstancedBufferAttribute(new Float32Array(centers), 3));
  geometry.setAttribute('cloudScale', new THREE.InstancedBufferAttribute(new Float32Array(scales), 2));
  geometry.setAttribute('cloudOpacity', new THREE.InstancedBufferAttribute(new Float32Array(opacity), 1));
  geometry.setAttribute('cloudTile', new THREE.InstancedBufferAttribute(new Float32Array(tiles), 1));
  const texture = cloudAtlas();
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAtlas: { value: texture }, uTint: { value: new THREE.Color('#5d6672') } },
    transparent: true, depthWrite: false,
    vertexShader: `
      attribute vec3 cloudCenter;
      attribute vec2 cloudScale;
      attribute float cloudOpacity;
      attribute float cloudTile;
      uniform float uTime;
      varying vec2 vUv;
      varying float vAlpha;
      void main() {
        float zInBox = mod(cloudCenter.z + 16.0 * uTime, 160.0);
        vec3 center = vec3(cloudCenter.xy, -120.0 + zInBox);
        float edge = smoothstep(0.0, 19.2, zInBox) * smoothstep(0.0, 19.2, 160.0 - zInBox);
        float lens = smoothstep(0.0, 3.0, distance(center, cameraPosition));
        float light = 0.05 + 1.5 * exp(-dot(center, center) / 1400.0);
        vAlpha = cloudOpacity * edge * lens * light;
        vUv = vec2((cloudTile + mix(0.002, 0.998, uv.x)) / 5.0, uv.y);
        vec4 viewCenter = modelViewMatrix * vec4(center, 1.0);
        viewCenter.xy += position.xy * cloudScale;
        gl_Position = projectionMatrix * viewCenter;
      }`,
    fragmentShader: `
      uniform sampler2D uAtlas;
      uniform vec3 uTint;
      varying vec2 vUv;
      varying float vAlpha;
      void main() {
        vec4 cloud = texture2D(uAtlas, vUv);
        float alpha = cloud.a * vAlpha;
        if (alpha < 0.002) discard;
        gl_FragColor = vec4(pow(cloud.rgb, vec3(2.2)) * uTint, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material); mesh.frustumCulled = false;
  plane.dispose();
  return { mesh, texture };
}

export class FlightScene {
  readonly canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, .1, 250);
  private jet = new THREE.Group();
  private cloud: ReturnType<typeof cloudBatch> | null = null;
  private environment: THREE.WebGLRenderTarget;
  private frame = 0;
  private elapsed = 0;
  private previousTime = 0;
  private renders = 0;
  private move: Move | null = null;
  private currentView: CameraView | null = null;
  private look = new THREE.Vector3();
  private resizeObserver: ResizeObserver;
  private visibilityObserver: IntersectionObserver;
  private dead = false;
  private active = true;
  private reduced = false;
  private topProgress = 0;
  private key: THREE.DirectionalLight;
  private mode: 'hero' | 'top' | 'detail';

  constructor(private host: HTMLElement, options: { mode?: 'hero' | 'top' | 'detail'; model?: string; finish?: Finish; onProgress?: (p: number) => void; onReady?: () => void; onError?: () => void } = {}) {
    this.mode = options.mode ?? 'hero';
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15; this.renderer.localClippingEnabled = true;
    this.canvas = this.renderer.domElement; this.canvas.setAttribute('aria-hidden', 'true'); this.host.append(this.canvas);
    this.scene.background = new THREE.Color('#05070a'); this.scene.fog = new THREE.FogExp2('#05070a', .03);
    this.environment = roomEnvironment(this.renderer); this.scene.environment = this.environment.texture;
    this.scene.add(new THREE.HemisphereLight('#9fb4cc', '#05070a', .35));
    this.key = new THREE.DirectionalLight('#fff6ec', 2.2); this.key.position.set(-6, 10, -4); this.scene.add(this.key);
    const rim = new THREE.DirectionalLight('#9fbadb', .7); rim.position.set(8, 2, 10); this.scene.add(rim); this.scene.add(this.jet);
    if (this.mode === 'hero') { this.cloud = cloudBatch(); this.scene.add(this.cloud.mesh); }
    this.camera.position.set(this.mode === 'top' ? 0 : 5.6, this.mode === 'top' ? 18 : .3, this.mode === 'top' ? .01 : -12.5);
    this.look.set(this.mode === 'hero' ? 3.4 : 0, this.mode === 'hero' ? -.5 : 0, this.mode === 'hero' ? -1 : 0); this.camera.lookAt(this.look);
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(this.host);
    this.visibilityObserver = new IntersectionObserver(([entry]) => this.setActive(entry.isIntersecting && entry.intersectionRatio > 0), { threshold: .001 }); this.visibilityObserver.observe(this.host);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
    void this.load(options.model ?? models.hero, options.finish ?? pearl, options.onProgress, options.onReady, options.onError);
  }

  private async load(url: string, finish: Finish, onProgress?: (p: number) => void, onReady?: () => void, onError?: () => void) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    try {
      const gltf = await loader.loadAsync(url, event => { if (!this.dead && event.total) onProgress?.(event.loaded / event.total); });
      const root = gltf.scene;
      if (this.dead) { disposeObject(root); return; }
      root.rotation.y = -Math.PI / 2; root.updateMatrixWorld(true);
      const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
      root.scale.setScalar(10 / Math.max(size.x, size.y, size.z)); root.updateMatrixWorld(true);
      root.position.sub(new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3()));
      const oldMaterials = new Set<THREE.Material>();
      root.traverse(obj => {
        if (!(obj instanceof THREE.Mesh)) return;
        const replace = (old: THREE.MeshStandardMaterial) => {
          oldMaterials.add(old);
          return new THREE.MeshPhysicalMaterial({ color: finish.color, metalness: finish.metalness, roughness: finish.roughness, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: finish.color === '#1a1d23' ? 2.4 : 1.7, map: old.map ?? null, normalMap: old.normalMap ?? null, fog: false, side: old.side });
        };
        obj.material = Array.isArray(obj.material) ? obj.material.map(replace) : replace(obj.material);
      });
      oldMaterials.forEach(material => material.dispose());
      this.jet.add(root); this.requestRender(); onProgress?.(1); onReady?.();
    } catch (error) { if (!this.dead) { console.error('Unable to load ARISE aircraft', error); onError?.(); } }
  }

  private adjusted(vector: [number, number, number], target: THREE.Vector3) {
    const result = v3(vector), aspect = this.camera.aspect;
    if (aspect < 1) result.sub(target).multiplyScalar(Math.min(2.2, 1.3 / aspect)).add(target);
    return result;
  }

  moveTo(view: CameraView, duration = 2600) {
    this.currentView = view;
    const target = v3(view.target), end = this.adjusted(view.pos, target);
    if (duration === 0) { this.move = null; this.camera.position.copy(end); this.look.copy(target); this.camera.lookAt(this.look); }
    else this.move = { started: performance.now(), duration, from: this.camera.position.clone(), to: end, via: view.via ? this.adjusted(view.via, target) : this.camera.position.clone().lerp(end, .5), lookFrom: this.look.clone(), lookTo: target };
    this.requestRender();
  }

  setTopProgress(progress: number) {
    const value = THREE.MathUtils.clamp(progress, 0, 1);
    if (Math.abs(value - this.topProgress) < .0001) return;
    this.topProgress = value; this.requestRender();
  }
  setReduced(value: boolean) { this.reduced = value; this.requestRender(); }
  setActive(value: boolean) {
    if (this.active === value) return;
    this.active = value; this.previousTime = 0;
    if (!value) { cancelAnimationFrame(this.frame); this.frame = 0; } else this.requestRender();
  }
  private onVisibility = () => {
    this.previousTime = 0;
    if (document.hidden) { cancelAnimationFrame(this.frame); this.frame = 0; } else this.requestRender();
  };
  private requestRender() {
    if (!this.frame && !this.dead && this.active && !document.hidden) this.frame = requestAnimationFrame(this.tick);
  }
  private resize() {
    const width = Math.max(1, this.host.clientWidth), height = Math.max(1, this.host.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.5 : 2));
    this.renderer.setSize(width, height, false); this.camera.aspect = width / height;
    this.camera.fov = this.mode === 'top' ? 34 : this.mode === 'detail' ? 38 : 40; this.camera.updateProjectionMatrix();
    if (this.currentView) this.moveTo(this.currentView, 0);
    this.requestRender();
  }
  private tick = (now: number) => {
    this.frame = 0;
    if (this.dead || !this.active || document.hidden) return;
    if (this.previousTime && !this.reduced) this.elapsed += Math.min((now - this.previousTime) / 1000, .05);
    this.previousTime = now;
    const t = this.elapsed;
    if (this.move) {
      const m = this.move, p = THREE.MathUtils.clamp((now - m.started) / m.duration, 0, 1), e = ease(p);
      this.camera.position.copy(m.from).multiplyScalar((1 - e) ** 2).addScaledVector(m.via, 2 * (1 - e) * e).addScaledVector(m.to, e * e);
      this.look.copy(m.lookFrom).lerp(m.lookTo, e); this.camera.lookAt(this.look);
      if (p >= 1) this.move = null;
    }
    if (this.mode === 'top') { this.jet.position.z = -3 + this.topProgress * 6; this.key.position.x = -6 + this.topProgress * 12; }
    else if (this.mode === 'hero' && !this.reduced) {
      this.jet.position.y = .06 * Math.sin(Math.PI * 2 * t / 6) + .025 * Math.sin(Math.PI * 2 * t / 4);
      this.jet.rotation.z = .006 * Math.sin(Math.PI * 2 * t / 12) + .0008 * Math.sin(Math.PI * 2 * t / .25); this.jet.rotation.x = .004 * Math.sin(Math.PI * 2 * t / 6);
    } else { this.jet.position.y = 0; this.jet.rotation.set(0, 0, 0); }
    if (this.cloud) this.cloud.mesh.material.uniforms.uTime.value = t;
    this.renderer.render(this.scene, this.camera);
    if (import.meta.env.DEV) { this.canvas.dataset.drawCalls = String(this.renderer.info.render.calls); this.canvas.dataset.renders = String(++this.renders); }
    if ((this.mode === 'hero' && !this.reduced) || this.move) this.requestRender();
  };

  dispose() {
    this.dead = true; cancelAnimationFrame(this.frame); this.resizeObserver.disconnect(); this.visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    disposeObject(this.scene); this.cloud?.texture.dispose(); this.environment.dispose();
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.canvas.remove();
  }
}
