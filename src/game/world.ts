import * as THREE from 'three';
import { ExplorerOrbit } from './orbit';
import { PATHS, ZONES, ITEM_OFFSETS, HEROES, type PathId, type HeroId } from '../data/content';

export type InteractKind = 'item' | 'hero' | 'archive' | 'flag' | 'hanif';
export interface InteractInfo {
  id: string;
  kind: InteractKind;
  label: string;
  itemId?: string;
}
export interface WorldCallbacks {
  onNear: (info: InteractInfo | null) => void;
  onInteract: (info: InteractInfo) => void;
  onPosition: (p: { x: number; z: number }) => void;
}
export interface WorldOptions {
  pathId: PathId;
  chapter: number;
  featuredHero: HeroId;
  foundIds: string[];
  paused: boolean;
  preview?: boolean;
}

interface Interactable {
  id: string;
  kind: InteractKind;
  label: string;
  itemId?: string;
  pos: THREE.Vector3;
  root: THREE.Object3D;
}

interface CharacterModel {
  root: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  phase: number;
}

const rnd = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

function makeFlagTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f7f1e3';
  ctx.fillRect(0, 0, 256, 160);
  ctx.fillStyle = '#b3261e';
  ctx.fillRect(0, 0, 256, 80);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const FLAG_TEXTURE = makeFlagTexture();

function makeLabel(text: string, accent = '#f1d392'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 640, 160);
  ctx.font = '600 54px "Plus Jakarta Sans", sans-serif';
  const metrics = ctx.measureText(text);
  const w = Math.min(600, metrics.width + 80);
  const x = (640 - w) / 2;
  const grd = ctx.createLinearGradient(0, 30, 0, 130);
  grd.addColorStop(0, 'rgba(7,26,27,.94)');
  grd.addColorStop(1, 'rgba(10,34,33,.94)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, 30, w, 100, 24);
  else ctx.rect(x, 30, w, 100);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fbf3e2';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 320, 82);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  sprite.scale.set(2.9, 0.73, 1);
  sprite.renderOrder = 20;
  return sprite;
}

function mat(color: string | number, opts: { rough?: number; metal?: number; emissive?: string; emissiveIntensity?: number } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.85,
    metalness: opts.metal ?? 0.05,
    emissive: opts.emissive ?? '#000000',
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
}

function box(w: number, h: number, d: number, color: string, opts?: Parameters<typeof mat>[1]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function circleCollider(x: number, z: number, r: number) {
  return { x, z, r };
}

function createCharacter(opts: {
  shirt: string;
  pants: string;
  skin: string;
  hair: string;
  accent: string;
  female?: boolean;
  headCover?: boolean;
  peci?: boolean;
  backpack?: boolean;
  scale?: number;
  longRobe?: boolean;
}): CharacterModel {
  const root = new THREE.Group();
  const scale = opts.scale ?? 1;
  const skin = mat(opts.skin, { rough: 0.9 });
  const shirt = mat(opts.shirt, { rough: 0.9 });
  const pants = mat(opts.pants, { rough: 0.92 });
  const accent = mat(opts.accent, { rough: 0.7, metal: 0.1 });
  const hairM = mat(opts.hair, { rough: 0.95 });

  const torso = new THREE.Group();
  torso.position.y = 1.02;
  root.add(torso);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.58, 10), shirt);
  chest.castShadow = true;
  torso.add(chest);

  if (opts.longRobe) {
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.95, 12, 1, true), shirt);
    robe.position.y = -0.28;
    robe.castShadow = true;
    torso.add(robe);
  }
  if (opts.female && !opts.longRobe) {
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.85, 12), pants);
    skirt.position.y = -0.38;
    skirt.castShadow = true;
    torso.add(skirt);
  }

  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.13, 0.5), accent);
  sash.position.set(0, -0.06, 0);
  sash.rotation.z = 0.18;
  torso.add(sash);

  if (opts.backpack) {
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.24), mat('#7b5330', { rough: 0.95 }));
    bag.position.set(0, 0.03, -0.32);
    bag.castShadow = true;
    torso.add(bag);
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.6, 0.06), mat('#5c3c22'));
    strap.position.set(-0.17, 0.02, 0.26);
    torso.add(strap);
  }

  const head = new THREE.Group();
  head.position.y = 0.48;
  torso.add(head);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.255, 20, 16), skin);
  face.castShadow = true;
  head.add(face);
  const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.268, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), hairM);
  hairTop.position.y = 0.035;
  head.add(hairTop);

  if (opts.headCover) {
    const veil = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.85), new THREE.MeshStandardMaterial({ color: opts.hair, roughness: 0.95, side: THREE.DoubleSide }));
    veil.rotation.x = -0.16;
    veil.position.y = 0.02;
    head.add(veil);
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.4, 14, 1, true), new THREE.MeshStandardMaterial({ color: opts.hair, roughness: 0.95, side: THREE.DoubleSide }));
    drape.position.y = -0.22;
    head.add(drape);
  }
  if (opts.peci) {
    const peci = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.245, 0.17, 14), mat('#141a1b', { rough: 0.8 }));
    peci.position.y = 0.25;
    head.add(peci);
  }

  const eyeGeo = new THREE.SphereGeometry(0.033, 8, 8);
  const eyeMat = mat('#201a15', { rough: 0.4 });
  [-0.09, 0.09].forEach((x) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(x, 0.02, 0.235);
    head.add(eye);
  });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.022, 0.02), mat('#8c4a3f'));
  mouth.position.set(0, -0.11, 0.24);
  head.add(mouth);

  const armGeo = new THREE.BoxGeometry(0.14, 0.56, 0.16);
  const handGeo = new THREE.SphereGeometry(0.085, 10, 8);
  const sleeve = mat(opts.shirt);
  const armL = new THREE.Group();
  armL.position.set(-0.36, 0.24, 0);
  const upperL = new THREE.Mesh(armGeo, sleeve);
  upperL.position.y = -0.28;
  upperL.castShadow = true;
  armL.add(upperL);
  const handL = new THREE.Mesh(handGeo, skin);
  handL.position.y = -0.6;
  armL.add(handL);
  torso.add(armL);
  const armR = new THREE.Group();
  armR.position.set(0.36, 0.24, 0);
  const upperR = new THREE.Mesh(armGeo, sleeve);
  upperR.position.y = -0.28;
  upperR.castShadow = true;
  armR.add(upperR);
  const handR = new THREE.Mesh(handGeo, skin);
  handR.position.y = -0.6;
  armR.add(handR);
  torso.add(armR);

  const legGeo = new THREE.BoxGeometry(0.19, 0.68, 0.22);
  const shoeGeo = new THREE.BoxGeometry(0.21, 0.14, 0.34);
  const legL = new THREE.Group();
  legL.position.set(-0.14, 0.86, 0);
  const lL = new THREE.Mesh(legGeo, pants);
  lL.position.y = -0.34;
  lL.castShadow = true;
  legL.add(lL);
  const shoeL = new THREE.Mesh(shoeGeo, mat('#3b2a1c'));
  shoeL.position.set(0, -0.68, 0.06);
  legL.add(shoeL);
  root.add(legL);
  const legR = new THREE.Group();
  legR.position.set(0.14, 0.86, 0);
  const lR = new THREE.Mesh(legGeo, pants);
  lR.position.y = -0.34;
  lR.castShadow = true;
  legR.add(lR);
  const shoeR = new THREE.Mesh(shoeGeo, mat('#3b2a1c'));
  shoeR.position.set(0, -0.68, 0.06);
  legR.add(shoeR);
  root.add(legR);

  root.scale.setScalar(scale);
  return { root, legL, legR, armL, armR, torso, head, phase: 0 };
}

export class AdventureWorld {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private callbacks: WorldCallbacks;
  private pathId: PathId;
  private chapter: number;
  private featuredHero: HeroId;
  private foundIds: string[] = [];
  private paused = false;
  private low = false;
  private disposed = false;

  private player!: CharacterModel;
  private hanif!: CharacterModel;
  private heroNpc: CharacterModel | null = null;
  private heroNpcRoot: THREE.Group | null = null;
  private playerPos = new THREE.Vector3(0, 0, 8);
  private playerVelY = 0;
  private grounded = true;
  private facing = 0;
  private moveInput = { x: 0, y: 0 };
  private running = false;
  readonly orbit: ExplorerOrbit;
  private readonly preview: boolean;
  private nearId: string | null = null;
  private keys = new Set<string>();
  private colliders: { x: number; z: number; r: number }[] = [];
  private interactables: Interactable[] = [];
  private questRoot: THREE.Group | null = null;
  private atmosphere: THREE.Points | null = null;
  private flags: { mesh: THREE.Mesh; base: Float32Array; phase: number }[] = [];
  private beacon: THREE.Object3D | null = null;
  private lastPosReport = 0;
  private sparkles: { mesh: THREE.Object3D; base: number; speed: number }[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private removed = new Set<string>();

  constructor(container: HTMLElement, options: WorldOptions, callbacks: WorldCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.pathId = options.pathId;
    this.chapter = options.chapter;
    this.featuredHero = options.featuredHero;
    this.foundIds = [...options.foundIds];
    this.paused = options.paused;
    this.preview = options.preview ?? false;
    this.low = window.innerWidth < 820 || (navigator.hardwareConcurrency ?? 8) <= 4;

    this.renderer = new THREE.WebGLRenderer({ antialias: !this.low, powerPreference: 'high-performance', alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.low ? 1.4 : 2));
    this.renderer.shadowMap.enabled = !this.low;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.domElement.className = 'block h-full w-full';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 240);
    this.buildEnvironment();
    this.orbit = new ExplorerOrbit(this.camera);
    this.orbit.setEnvironment(this.scene);
    this.orbit.connect(this.renderer.domElement);
    this.buildPlayerAndGuide();
    this.applyChapter(this.chapter, true);
    this.bindInputs();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.orbit.setPaused(this.paused);
    this.clock.start();
    this.animate();
  }

  private theme() {
    return PATHS[this.pathId].scene;
  }

  private buildEnvironment() {
    const theme = this.theme();
    this.scene.background = new THREE.Color(theme.skyBottom);
    this.scene.fog = new THREE.Fog(theme.fog, 26, 88);

    const skyGeo = new THREE.SphereGeometry(130, 24, 18);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(theme.skyTop) },
        bottomColor: { value: new THREE.Color(theme.skyBottom) },
        offset: { value: 12 },
        exponent: { value: 0.75 },
      },
      vertexShader: `varying vec3 vWorldPosition; void main(){ vec4 worldPosition = modelMatrix * vec4(position, 1.0); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main(){ float h = normalize(vWorldPosition + offset).y; gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0); }`,
    });
    this.scene.add(new THREE.Mesh(skyGeo, skyMat));

    const hemi = new THREE.HemisphereLight(new THREE.Color(theme.skyTop).lerp(new THREE.Color('#ffffff'), 0.35), new THREE.Color(theme.ground), 1.25);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight('#ffe4b0', 2.5);
    sun.position.set(22, 34, 16);
    sun.castShadow = !this.low;
    if (!this.low) {
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -34;
      sun.shadow.camera.right = 34;
      sun.shadow.camera.top = 34;
      sun.shadow.camera.bottom = -34;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 90;
      sun.shadow.bias = -0.0012;
    }
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(theme.skyTop, 0.55);
    fill.position.set(-20, 14, -18);
    this.scene.add(fill);

    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(5.4, 20, 20), new THREE.MeshBasicMaterial({ color: '#ffe1a3', fog: false }));
    sunDisc.position.set(46, 34, -70);
    this.scene.add(sunDisc);

    const groundGeo = new THREE.CircleGeometry(58, 64);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({ color: theme.ground, roughness: 1, metalness: 0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const plaza = new THREE.Mesh(new THREE.CircleGeometry(9, 40), mat(theme.path, { rough: 1 }));
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    const connect = (x: number, z: number, w = 3.4) => {
      const len = Math.hypot(x, z);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, len), mat(theme.path, { rough: 1 }));
      p.rotation.x = -Math.PI / 2;
      p.rotation.z = -Math.atan2(x, z);
      p.position.set(x / 2, 0.025, z / 2);
      p.receiveShadow = true;
      this.scene.add(p);
    };
    Object.entries(ZONES).forEach(([key, z]) => {
      if (key === '1') return;
      connect(z.x, z.z);
    });

    const random = rnd(84);
    const avoid = [
      { x: 0, z: 0, r: 10 },
      { x: 0, z: -19, r: 8 },
      { x: 19, z: 0, r: 9 },
      { x: -19, z: 0, r: 8 },
      { x: 0, z: 21, r: 9 },
    ];
    const clear = (x: number, z: number, extra = 0) => avoid.every((a) => Math.hypot(x - a.x, z - a.z) > a.r + extra);

    const makePalm = (x: number, z: number, s: number) => {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.27 * s, 4.2 * s, 6), mat(theme.wood, { rough: 1 }));
      trunk.position.y = 2.1 * s;
      trunk.castShadow = true;
      trunk.rotation.z = (random() - 0.5) * 0.18;
      g.add(trunk);
      for (let i = 0; i < 6; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.9 * s, 6, 5), mat(theme.grass, { rough: 1 }));
        leaf.scale.set(1.7, 0.2, 0.55);
        const a = (i / 6) * Math.PI * 2;
        leaf.position.set(Math.cos(a) * 1.1 * s, 4.1 * s + Math.sin(i) * 0.15, Math.sin(a) * 1.1 * s);
        leaf.rotation.y = -a;
        leaf.rotation.z = -0.22;
        leaf.castShadow = !this.low;
        g.add(leaf);
      }
      const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s, 7, 6), mat('#6d5227'));
      coconut.position.set(0.2, 3.8 * s, 0.2);
      g.add(coconut);
      g.position.set(x, 0, z);
      this.scene.add(g);
    };

    const treeCount = this.low ? 20 : 34;
    for (let i = 0; i < treeCount; i++) {
      const a = random() * Math.PI * 2;
      const r = 12 + random() * 32;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!clear(x, z, 0)) continue;
      makePalm(x, z, 0.75 + random() * 0.6);
    }

    for (let i = 0; i < (this.low ? 16 : 30); i++) {
      const a = random() * Math.PI * 2;
      const r = 8 + random() * 36;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!clear(x, z, -2)) continue;
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65 + random() * 0.7, 1), mat(random() > 0.5 ? theme.grass : '#4b6a3d', { rough: 1 }));
      bush.position.set(x, 0.4, z);
      bush.scale.y = 0.72;
      bush.castShadow = !this.low;
      this.scene.add(bush);
    }

    for (let i = 0; i < 18; i++) {
      const a = random() * Math.PI * 2;
      const r = 10 + random() * 30;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!clear(x, z, -2)) continue;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + random() * 0.5, 0), mat('#8b8677', { rough: 1 }));
      rock.position.set(x, 0.25, z);
      rock.rotation.set(random(), random(), random());
      rock.castShadow = !this.low;
      this.scene.add(rock);
    }

    const flowers = ['#e8c06a', '#e6d7ba', '#cf7c5b', '#f3e3ac'];
    for (let i = 0; i < (this.low ? 22 : 44); i++) {
      const a = random() * Math.PI * 2;
      const r = 7 + random() * 32;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.12 + random() * 0.08, 6, 5), new THREE.MeshStandardMaterial({ color: flowers[i % flowers.length], emissive: flowers[i % flowers.length], emissiveIntensity: 0.12, roughness: 0.9 }));
      f.position.set(x, 0.25 + random() * 0.2, z);
      this.scene.add(f);
    }

    this.buildVillage(theme);
    this.buildPendopo(theme);
    this.buildForest(theme);
    this.buildArchive(theme);
    this.buildHill(theme);

    const particleCount = this.low ? 90 : 180;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (random() - 0.5) * 62;
      pos[i * 3 + 1] = 0.6 + random() * 11;
      pos[i * 3 + 2] = (random() - 0.5) * 62;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.atmosphere = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#f6e3b3', size: 0.075, transparent: true, opacity: 0.55, depthWrite: false }));
    this.scene.add(this.atmosphere);

    for (let i = 0; i < 5; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(5 + random() * 4, 10, 7), new THREE.MeshBasicMaterial({ color: '#f4e8d3', transparent: true, opacity: 0.13, fog: false }));
      cloud.scale.set(2.2, 0.5, 1);
      cloud.position.set((random() - 0.5) * 90, 26 + random() * 12, (random() - 0.5) * 90);
      this.scene.add(cloud);
    }
  }

  private addFlag(parent: THREE.Group, x: number, _y: number, z: number, scale = 1, poleHeight = 5) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055 * scale, 0.07 * scale, poleHeight * scale, 8), mat('#d8d1bd', { rough: 0.5, metal: 0.4 }));
    pole.position.set(x, (poleHeight * scale) / 2, z);
    pole.castShadow = !this.low;
    parent.add(pole);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 10, 8), mat('#d9ac5c', { metal: 0.6, rough: 0.3 }));
    knob.position.set(x, poleHeight * scale, z);
    parent.add(knob);
    const geo = new THREE.PlaneGeometry(2.1 * scale, 1.25 * scale, 12, 4);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: FLAG_TEXTURE, side: THREE.DoubleSide, roughness: 0.85 }));
    mesh.position.set(x + 1.07 * scale, poleHeight * scale - 0.7 * scale, z);
    mesh.castShadow = !this.low;
    parent.add(mesh);
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    this.flags.push({ mesh, base: Float32Array.from(posAttr.array), phase: x + z });
  }

  private buildVillage(theme: ReturnType<AdventureWorld['theme']>) {
    const village = new THREE.Group();
    const houses = [
      { x: -10, z: -6, rot: 0.25, w: 4.4 },
      { x: 9.5, z: -7.5, rot: -0.35, w: 3.8 },
      { x: -10.5, z: 7.2, rot: -0.2, w: 4 },
      { x: 10, z: 8, rot: 0.4, w: 4.6 },
    ];
    houses.forEach((h, idx) => {
      const g = new THREE.Group();
      const base = box(h.w, 2.2, h.w * 0.8, theme.wood);
      base.position.y = 1.1;
      g.add(base);
      const plaster = box(h.w * 0.92, 1.05, h.w * 0.73, idx % 2 === 0 ? '#d9c7a1' : '#c8b186');
      plaster.position.y = 0.9;
      g.add(plaster);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(h.w * 0.82, 1.5, 4), mat(theme.roof, { rough: 0.9 }));
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 2.95;
      roof.castShadow = true;
      g.add(roof);
      const door = box(0.72, 1.2, 0.09, '#4c3520');
      door.position.set(0, 0.62, h.w * 0.4 + 0.02);
      g.add(door);
      const windowM = box(0.62, 0.55, 0.08, '#f2d79c', { emissive: '#f2d79c', emissiveIntensity: 0.35 });
      windowM.position.set(h.w * 0.28, 1.35, h.w * 0.4 + 0.02);
      g.add(windowM);
      const awning = box(1.2, 0.12, 0.6, theme.roof);
      awning.position.set(0, 1.9, h.w * 0.45);
      g.add(awning);
      g.position.set(h.x, 0, h.z);
      g.rotation.y = h.rot;
      village.add(g);
      this.colliders.push(circleCollider(h.x, h.z, h.w * 0.56));
    });

    const wellX = 4.6;
    const wellZ = -1.8;
    const well = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.22, 8, 18), mat('#8c8674', { rough: 1 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.22;
    well.add(ring);
    const post1 = box(0.12, 1.5, 0.12, '#6b4f32');
    post1.position.set(-0.7, 0.75, 0);
    well.add(post1);
    const post2 = box(0.12, 1.5, 0.12, '#6b4f32');
    post2.position.set(0.7, 0.75, 0);
    well.add(post2);
    const roofW = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.6, 4), mat(theme.roof));
    roofW.rotation.y = Math.PI / 4;
    roofW.position.y = 1.7;
    well.add(roofW);
    well.position.set(wellX, 0, wellZ);
    village.add(well);
    this.colliders.push(circleCollider(wellX, wellZ, 1.1));

    const cart = new THREE.Group();
    const body = box(1.7, 0.65, 1, '#7d5b36');
    body.position.y = 0.85;
    cart.add(body);
    [-0.6, 0.6].forEach((x) => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.08, 6, 12), mat('#4e3a24'));
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(x, 0.4, 0.55);
      cart.add(wheel);
    });
    cart.position.set(-4.8, 0, 4.4);
    cart.rotation.y = 0.7;
    village.add(cart);

    for (let i = 0; i < 4; i++) {
      const lantern = new THREE.Group();
      const pole = box(0.09, 2.4, 0.09, '#4e3b28');
      pole.position.y = 1.2;
      lantern.add(pole);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshStandardMaterial({ color: '#ffe2a5', emissive: theme.glow, emissiveIntensity: 2.2 }));
      lamp.position.y = 2.45;
      lantern.add(lamp);
      const a = (i / 4) * Math.PI * 2 + 0.4;
      lantern.position.set(Math.cos(a) * 7.4, 0, Math.sin(a) * 7.4);
      village.add(lantern);
      const light = new THREE.PointLight(theme.glow, this.low ? 0 : 1.1, 8, 2);
      light.position.copy(lantern.position).add(new THREE.Vector3(0, 2.4, 0));
      village.add(light);
    }

    this.addFlag(village, 1.6, 0, -2.8, 1, 5.2);

    const stall = new THREE.Group();
    const table = box(2.6, 0.15, 1.1, '#79552f');
    table.position.y = 1;
    stall.add(table);
    [-1.1, 1.1].forEach((x) => {
      const leg = box(0.1, 1, 0.1, '#5c4024');
      leg.position.set(x, 0.5, 0);
      stall.add(leg);
    });
    for (let i = 0; i < 3; i++) {
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.22, 9), mat('#b48a4f'));
      basket.position.set(-0.7 + i * 0.7, 1.2, 0);
      stall.add(basket);
    }
    const canopy = box(2.9, 0.1, 1.4, theme.roof);
    canopy.position.y = 2.2;
    canopy.rotation.x = -0.08;
    stall.add(canopy);
    stall.position.set(7.2, 0, 2.4);
    stall.rotation.y = -0.5;
    village.add(stall);

    this.scene.add(village);
  }

  private buildPendopo(theme: ReturnType<AdventureWorld['theme']>) {
    const zc = ZONES[2];
    const g = new THREE.Group();
    const platform = box(8.4, 0.4, 7, '#b8a688');
    platform.position.y = 0.2;
    g.add(platform);
    const step = box(4, 0.18, 0.8, '#a8967a');
    step.position.set(0, 0.09, 3.8);
    g.add(step);
    for (let i = 0; i < 4; i++) {
      const x = i < 2 ? -3.4 : 3.4;
      const z = i % 2 === 0 ? -2.5 : 2.5;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 4.1, 8), mat(theme.wood, { rough: 0.75 }));
      pillar.position.set(x, 2.3, z);
      pillar.castShadow = true;
      g.add(pillar);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 3.2, 4), mat(theme.roof, { rough: 0.9 }));
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 5.8;
    roof.castShadow = true;
    g.add(roof);
    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(4.4, 2.2, 4), mat(theme.roof, { rough: 0.9 }));
    roof2.rotation.y = Math.PI / 4;
    roof2.position.y = 7.6;
    g.add(roof2);
    const rail = box(8, 0.14, 0.12, theme.wood);
    rail.position.set(0, 1.2, 3.3);
    g.add(rail);
    for (let i = 0; i < 8; i++) {
      const post = box(0.09, 1, 0.09, theme.wood);
      post.position.set(-3.6 + i, 0.7, 3.3);
      g.add(post);
    }
    for (let i = 0; i < 4; i++) {
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshStandardMaterial({ color: '#f7d998', emissive: theme.glow, emissiveIntensity: 2 }));
      bowl.position.set(i < 2 ? -4 : 4, 1.55, i % 2 === 0 ? -2.6 : 2.6);
      g.add(bowl);
    }
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2), new THREE.MeshStandardMaterial({ map: FLAG_TEXTURE, side: THREE.DoubleSide, roughness: 0.9 }));
    banner.position.set(0, 3.1, -3.3);
    g.add(banner);
    const label = makeLabel('Pendopo Pahlawan');
    label.position.set(0, 8.9, 0);
    g.add(label);
    g.position.set(zc.x, 0, zc.z);
    this.scene.add(g);
    [
      [-3.4, -2.5], [3.4, -2.5], [-3.4, 2.5], [3.4, 2.5],
    ].forEach(([x, z]) => this.colliders.push(circleCollider(zc.x + x, zc.z + z, 0.45)));
  }

  private buildForest(theme: ReturnType<AdventureWorld['theme']>) {
    const zc = ZONES[3];
    const g = new THREE.Group();
    const random = rnd(133);
    for (let i = 0; i < (this.low ? 8 : 13); i++) {
      const x = (random() - 0.5) * 13;
      const z = (random() - 0.5) * 13;
      if (Math.abs(x) < 2.4 && Math.abs(z) < 4) continue;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.38, 3.7, 7), mat(theme.wood, { rough: 1 }));
      trunk.position.y = 1.85;
      trunk.castShadow = true;
      tree.add(trunk);
      for (let j = 0; j < 3; j++) {
        const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35 - j * 0.22, 1), mat(j % 2 === 0 ? theme.grass : '#3e5f39', { rough: 1 }));
        crown.position.y = 3.4 + j * 0.8;
        crown.castShadow = !this.low;
        tree.add(crown);
      }
      tree.position.set(x, 0, z);
      g.add(tree);
      this.colliders.push(circleCollider(zc.x + x, zc.z + z, 0.5));
    }
    const water = new THREE.Mesh(new THREE.PlaneGeometry(13, 2.6), new THREE.MeshStandardMaterial({ color: '#416e70', roughness: 0.25, metalness: 0.35, transparent: true, opacity: 0.9 }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.05, 5);
    g.add(water);
    for (let i = 0; i < 9; i++) {
      const plank = box(1.15, 0.12, 2.9, i % 2 ? '#8c6a42' : '#7a5a37');
      plank.position.set(-3.6 + i * 0.92, 0.24 + (i % 3 === 0 ? 0.06 : 0), 5);
      plank.rotation.z = (i % 2 ? 1 : -1) * 0.012;
      g.add(plank);
    }
    [-3.8, 3.8].forEach((x) => {
      [-1.1, 1.1].forEach((z) => {
        const post = box(0.16, 1.1, 0.16, '#61462c');
        post.position.set(x, 0.55, 5 + z);
        g.add(post);
      });
    });
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 7.8, 5), mat('#caa774'));
    rope.rotation.z = Math.PI / 2;
    rope.position.set(0, 1.05, 4);
    g.add(rope);
    const label = makeLabel('Jembatan Harapan');
    label.position.set(0, 2.8, 5);
    g.add(label);
    g.position.set(zc.x, 0, zc.z);
    this.scene.add(g);
  }

  private buildArchive(theme: ReturnType<AdventureWorld['theme']>) {
    const zc = ZONES[4];
    const g = new THREE.Group();
    const base = box(8.2, 4.6, 6.4, '#cfbd9b');
    base.position.y = 2.3;
    g.add(base);
    const trim = box(8.6, 0.35, 6.8, '#8c6c46');
    trim.position.y = 4.65;
    g.add(trim);
    for (let i = 0; i < 4; i++) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 4.3, 10), mat('#e1d2b8', { rough: 0.8 }));
      pillar.position.set(-3 + i * 2, 2.15, 3.5);
      pillar.castShadow = true;
      g.add(pillar);
    }
    const pediment = new THREE.Mesh(new THREE.ConeGeometry(6.2, 1.7, 4), mat(theme.roof, { rough: 0.8 }));
    pediment.rotation.y = Math.PI / 4;
    pediment.position.y = 5.6;
    pediment.castShadow = true;
    g.add(pediment);
    const door = box(1.8, 2.7, 0.14, '#3e2f20');
    door.position.set(0, 1.35, 3.23);
    g.add(door);
    const glowDoor = box(0.7, 0.3, 0.16, '#f3d18c', { emissive: '#f3d18c', emissiveIntensity: 1.2 });
    glowDoor.position.set(0, 1.6, 3.3);
    g.add(glowDoor);
    for (let i = 0; i < 2; i++) {
      const windowM = box(1.3, 1.5, 0.12, '#edd7a7', { emissive: '#e7bf78', emissiveIntensity: 0.45 });
      windowM.position.set(-2.2 + i * 4.4, 2.6, 3.26);
      g.add(windowM);
    }
    const stairs = box(2.8, 0.18, 0.8, '#b6a484');
    stairs.position.set(0, 0.09, 3.9);
    g.add(stairs);
    const label = makeLabel('Rumah Arsip');
    label.position.set(0, 6.8, 0);
    label.scale.set(2.6, 0.65, 1);
    g.add(label);
    g.position.set(zc.x, 0, zc.z);
    this.scene.add(g);
    this.colliders.push(circleCollider(zc.x, zc.z, 4.2));
  }

  private buildHill(theme: ReturnType<AdventureWorld['theme']>) {
    const zc = ZONES[5];
    const g = new THREE.Group();
    const layers = [10, 7.4, 4.8, 2.4];
    layers.forEach((r, i) => {
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.5, 0.32, 36), mat(i % 2 === 0 ? '#b7a37f' : '#a5906c', { rough: 1 }));
      plinth.position.y = 0.16 + i * 0.3;
      plinth.receiveShadow = true;
      g.add(plinth);
    });
    const obelisk = new THREE.Mesh(new THREE.ConeGeometry(1.05, 4.5, 4), mat('#d7ceba', { rough: 0.7 }));
    obelisk.rotation.y = Math.PI / 4;
    obelisk.position.set(0, 5.4, -1.4);
    obelisk.castShadow = true;
    g.add(obelisk);
    const plaque = box(2.1, 0.9, 0.1, '#8a7147');
    plaque.position.set(0, 2.5, -1.0);
    g.add(plaque);
    this.addFlag(g, 0, 0, 2.1, 1.9, 7.2);
    const crowdColors = ['#7c5a44', '#3f5b50', '#6f4a4a', '#4f4f63', '#6d5b35'];
    for (let i = 0; i < 6; i++) {
      const c = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.4, 6), mat(crowdColors[i % crowdColors.length]));
      body.position.y = 0.7;
      c.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat(i % 2 ? '#a77450' : '#b98a63'));
      head.position.y = 1.55;
      c.add(head);
      const a = -1.1 + i * 0.44;
      c.position.set(Math.sin(a) * 7.4, 0.9, 4 + Math.cos(a) * 1.6);
      c.rotation.y = Math.PI;
      g.add(c);
    }
    for (let i = 0; i < 4; i++) {
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshStandardMaterial({ color: '#ffe4ab', emissive: theme.glow, emissiveIntensity: 2 }));
      lantern.position.set(-5 + i * 3.3, 1.35, 6.6);
      g.add(lantern);
      const post = box(0.09, 1.35, 0.09, '#5b4832');
      post.position.set(-5 + i * 3.3, 0.67, 6.6);
      g.add(post);
    }
    const label = makeLabel('Bukit Merah Putih');
    label.position.set(0, 9.4, 2.1);
    g.add(label);
    g.position.set(zc.x, 0, zc.z);
    this.scene.add(g);
    this.colliders.push(circleCollider(zc.x, zc.z - 1.4, 2.2));
  }

  private buildPlayerAndGuide() {
    const player = createCharacter({
      shirt: '#274b46',
      pants: '#3b4c5a',
      skin: '#b98a63',
      hair: '#161b1b',
      accent: '#d9ac5c',
      backpack: true,
    });
    this.player = player;
    this.scene.add(player.root);

    const hanif = createCharacter({
      shirt: '#1e4d49',
      pants: '#3f3c34',
      skin: '#b07b57',
      hair: '#141818',
      accent: '#d9ac5c',
      backpack: true,
      scale: 0.95,
    });
    const compass = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 18), mat('#d9ac5c', { metal: 0.8, rough: 0.25 }));
    rim.rotation.x = Math.PI / 2.4;
    compass.add(rim);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshStandardMaterial({ color: '#ffe5a8', emissive: '#e9b96a', emissiveIntensity: 2.5 }));
    compass.add(core);
    compass.position.set(0.44, 0.95, 0.28);
    hanif.root.add(compass);
    const light = new THREE.PointLight('#f3cf87', this.low ? 0 : 1.4, 5, 2);
    light.position.set(0.44, 1, 0.3);
    hanif.root.add(light);
    hanif.root.position.set(1.9, 0, 9.4);
    const label = makeLabel('HANIF');
    label.position.y = 2.25;
    label.scale.set(2.2, 0.55, 1);
    hanif.root.add(label);
    this.hanif = hanif;
    this.scene.add(hanif.root);
    this.interactables.push({
      id: 'hanif-npc',
      kind: 'hanif',
      label: 'Bicara dengan HANIF',
      pos: hanif.root.position.clone(),
      root: hanif.root,
    });
  }

  private addGlowRing(parent: THREE.Group, radius: number, color: string) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.035, 6, 42), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05;
    parent.add(ring);
    return ring;
  }

  private addSparkle(parent: THREE.Group, color: string, y = 1.2) {
    const geo = new THREE.OctahedronGeometry(0.14, 0);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.8, roughness: 0.3, metalness: 0.4 }));
    mesh.position.y = y;
    mesh.scale.set(1, 1.6, 1);
    parent.add(mesh);
    this.sparkles.push({ mesh, base: y, speed: 1 + Math.random() });
  }

  private createHeroNpc(heroId: HeroId) {
    const hero = HEROES[heroId];
    const zc = ZONES[2];
    const root = new THREE.Group();
    const model = createCharacter({
      shirt: hero.colors.robe,
      pants: hero.colors.robe,
      skin: hero.colors.skin,
      hair: hero.colors.head,
      accent: hero.colors.accent,
      female: hero.gender === 'female',
      headCover: hero.gender === 'female',
      peci: hero.gender === 'male' && heroId !== 'kihajar',
      longRobe: heroId === 'diponegoro' || heroId === 'kihajar' || heroId === 'tjokro',
    });
    root.add(model.root);
    root.position.set(zc.x, 0.45, zc.z + 0.6);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.45, 0.4, 22), mat('#bfa67d', { rough: 0.9 }));
    pedestal.position.y = 0.2;
    root.add(pedestal);
    this.addGlowRing(root, 1.75, '#f0d08c');
    this.addSparkle(root, '#f3d392', 2.7);
    const label = makeLabel(hero.name, '#f3d392');
    label.position.y = 3.2;
    label.scale.set(3.3, 0.8, 1);
    root.add(label);
    (this.questRoot ?? this.scene).add(root);
    this.heroNpc = model;
    this.heroNpcRoot = root;
  }

  private createItemObjects(chapter: number) {
    const chapterData = PATHS[this.pathId].chapters[chapter - 1];
    if (!chapterData) return;
    const zone = ZONES[chapter] ?? ZONES[1];
    chapterData.items.forEach((item, i) => {
      if (this.foundIds.includes(item.id) || this.removed.has(item.id)) return;
      const offset = ITEM_OFFSETS[i] ?? { x: 0, z: 3 };
      const root = new THREE.Group();
      root.position.set(zone.x + offset.x, 0, zone.z + offset.z);
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 0.25, 10), mat('#b9a67f', { rough: 0.9 }));
      pedestal.position.y = 0.12;
      pedestal.receiveShadow = true;
      root.add(pedestal);
      this.addGlowRing(root, 0.95, '#f0d08c');
      this.addSparkle(root, '#f5d795', 1.35);
      const label = makeLabel(item.name);
      label.position.y = 2.15;
      label.scale.set(2.6, 0.65, 1);
      root.add(label);
      const glow = new THREE.PointLight('#f0c982', this.low ? 0 : 0.7, 4, 2);
      glow.position.y = 1.2;
      root.add(glow);
      (this.questRoot ?? this.scene).add(root);
      this.interactables.push({
        id: `item-${item.id}-${i}`,
        kind: 'item',
        label: `Periksa ${item.name}`,
        itemId: item.id,
        pos: new THREE.Vector3(zone.x + offset.x, 0, zone.z + offset.z),
        root,
      });
    });
  }

  private buildBeacon(pos: THREE.Vector3) {
    const root = new THREE.Group();
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.8, 5, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: '#f3d08a', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
    );
    beam.position.y = 2.5;
    root.add(beam);
    this.addGlowRing(root, 1.15, '#f5d696');
    root.position.copy(pos);
    this.scene.add(root);
    this.beacon = root;
  }

  private applyChapter(n: number, _first = false) {
    this.chapter = n;
    this.heroNpc = null;
    this.heroNpcRoot = null;
    this.sparkles = [];
    this.interactables = this.interactables.filter((i) => i.kind === 'hanif');
    if (this.questRoot) {
      this.scene.remove(this.questRoot);
      this.questRoot = null;
    }
    if (this.beacon) {
      this.scene.remove(this.beacon);
      this.beacon = null;
    }
    const data = PATHS[this.pathId].chapters[n - 1];
    if (!data) return;
    const zone = ZONES[n];
    const g = new THREE.Group();
    this.questRoot = g;
    this.scene.add(g);
    if (!this.preview) this.createItemObjects(n);

    if (n === 2) {
      this.createHeroNpc(this.featuredHero);
      this.interactables.push({
        id: 'hero-npc',
        kind: 'hero',
        label: `Bicara dengan ${HEROES[this.featuredHero].name}`,
        pos: new THREE.Vector3(ZONES[2].x, 0, ZONES[2].z + 0.6),
        root: this.heroNpcRoot!,
      });
      this.buildBeacon(new THREE.Vector3(ZONES[2].x, 0, ZONES[2].z + 0.8));
    } else if (n === 4) {
      const archiveRoot = new THREE.Group();
      archiveRoot.position.set(zone.x, 0, zone.z + 4.3);
      const desk = box(2.3, 0.9, 1.1, '#6a4e32');
      desk.position.y = 0.45;
      archiveRoot.add(desk);
      const book = box(0.8, 0.16, 0.55, '#8f2e28');
      book.position.set(0, 1.02, 0);
      book.rotation.y = 0.3;
      archiveRoot.add(book);
      this.addSparkle(archiveRoot, '#f3d18c', 1.7);
      this.addGlowRing(archiveRoot, 1.3, '#f0d08c');
      const label = makeLabel('Arsip Dokumen');
      label.position.y = 2.3;
      archiveRoot.add(label);
      (this.questRoot ?? this.scene).add(archiveRoot);
      this.interactables.push({
        id: 'archive-desk',
        kind: 'archive',
        label: 'Periksa Arsip Pahlawan Nasional',
        pos: new THREE.Vector3(zone.x, 0, zone.z + 4.3),
        root: archiveRoot,
      });
      this.buildBeacon(new THREE.Vector3(zone.x, 0, zone.z + 4.3));
    } else if (n === 5) {
      const flagRoot = new THREE.Group();
      flagRoot.position.set(zone.x, 0, zone.z + 2.1);
      this.addGlowRing(flagRoot, 1.7, '#f5d696');
      (this.questRoot ?? this.scene).add(flagRoot);
      this.interactables.push({
        id: 'final-flag',
        kind: 'flag',
        label: 'Tutup petualangan bersama HANIF',
        pos: new THREE.Vector3(zone.x, 0, zone.z + 2.1),
        root: flagRoot,
      });
      this.buildBeacon(new THREE.Vector3(zone.x, 0, zone.z + 2.1));
    } else if (!this.preview) {
      this.buildBeacon(new THREE.Vector3(zone.x, 0, zone.z));
    }

    const spawn = zone;
    this.playerPos.set(spawn.spawnX, 0, spawn.spawnZ);
    this.playerVelY = 0;
    this.grounded = true;
    this.facing = Math.atan2(zone.x - spawn.spawnX, zone.z - spawn.spawnZ);
    this.player.root.position.copy(this.playerPos);
    this.player.root.rotation.y = this.facing;
    this.hanif.root.position.set(spawn.spawnX + 1.4, 0, spawn.spawnZ + 1.2);
    this.orbit.reset(this.playerPos, this.facing);
    this.callbacks.onPosition({ x: this.playerPos.x, z: this.playerPos.z });
  }

  updateOptions(opts: Partial<WorldOptions>) {
    if (opts.foundIds) this.foundIds = [...opts.foundIds];
    if (opts.featuredHero) this.featuredHero = opts.featuredHero;
    if (opts.chapter != null && opts.chapter !== this.chapter) {
      this.applyChapter(opts.chapter);
    }
    if (opts.paused != null) this.setPaused(opts.paused);
  }

  removeItem(itemId: string) {
    this.removed.add(itemId);
    const found = this.interactables.filter((i) => i.itemId === itemId);
    found.forEach((i) => {
      if (i.root.parent) i.root.parent.remove(i.root);
    });
    this.interactables = this.interactables.filter((i) => i.itemId !== itemId);
    if (!this.removed.has(itemId)) return;
    if (this.nearId && !this.interactables.some((i) => i.id === this.nearId)) {
      this.nearId = null;
      this.callbacks.onNear(null);
    }
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    this.orbit.setPaused(paused);
    if (paused) {
      this.running = false;
      this.keys.clear();
      this.moveInput = { x: 0, y: 0 };
    }
  }

  setMove(x: number, y: number) {
    this.moveInput = { x, y };
  }

  setRunning(run: boolean) {
    this.running = run;
  }

  jump() {
    if (!this.grounded || this.paused) return;
    this.playerVelY = 7.4;
    this.grounded = false;
  }

  interact() {
    if (this.paused) return;
    const target = this.closestInteractable();
    if (target) this.callbacks.onInteract({ id: target.id, kind: target.kind, label: target.label, itemId: target.itemId });
  }

  private closestInteractable(): Interactable | null {
    let best: Interactable | null = null;
    let bestDist = Infinity;
    for (const it of this.interactables) {
      const d = it.pos.distanceTo(this.playerPos);
      const radius = it.kind === 'hanif' ? 4.6 : 3.2;
      if (d < radius && d < bestDist) {
        if (it.kind === 'hanif' && this.interactables.some((o) => o.kind !== 'hanif' && o.pos.distanceTo(this.playerPos) < 3.2)) continue;
        best = it;
        bestDist = d;
      }
    }
    return best;
  }

  private bindInputs() {
    if (this.preview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (this.paused || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        this.keys.add(key);
        e.preventDefault();
      }
      if (key === 'shift') this.running = true;
      if (key === ' ' && !target?.closest('button')) {
        if (!e.repeat) this.jump();
        e.preventDefault();
      }
      if (key === 'e' && !e.repeat) {
        this.interact();
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
      if (key === 'shift') this.running = false;
    };
    const clear = () => {
      this.keys.clear();
      this.running = false;
      this.moveInput = { x: 0, y: 0 };
    };
    const visibility = () => { if (document.hidden) clear(); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', visibility);
    this.cleanupInputs = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', visibility);
    };
  }

  private cleanupInputs: () => void = () => {};

  private resize() {
    if (this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.low ? 1.4 : 2));
  }

  private updatePlayer(dt: number) {
    let ix = 0;
    let iy = 0;
    if (!this.paused) {
      ix = this.moveInput.x;
      iy = this.moveInput.y;
      if (this.keys.has('w') || this.keys.has('arrowup')) iy += 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) iy -= 1;
      if (this.keys.has('a') || this.keys.has('arrowleft')) ix -= 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) ix += 1;
    }
    const mag = Math.hypot(ix, iy);
    if (mag > 1) {
      ix /= mag;
      iy /= mag;
    }
    const forward = new THREE.Vector3(-Math.sin(this.orbit.azimuth), 0, -Math.cos(this.orbit.azimuth));
    const right = new THREE.Vector3(Math.cos(this.orbit.azimuth), 0, -Math.sin(this.orbit.azimuth));
    const dir = forward.multiplyScalar(iy).add(right.multiplyScalar(ix));
    const moving = dir.lengthSq() > 0.0004 && !this.paused;
    if (moving) {
      dir.normalize();
      const speed = this.running ? 7.1 : 4.15;
      const nx = this.playerPos.x + dir.x * speed * dt;
      const nz = this.playerPos.z + dir.z * speed * dt;
      const bound = 38;
      this.playerPos.x = THREE.MathUtils.clamp(nx, -bound, bound);
      this.playerPos.z = THREE.MathUtils.clamp(nz, -bound, bound);
      for (const c of this.colliders) {
        const dx = this.playerPos.x - c.x;
        const dz = this.playerPos.z - c.z;
        const dist = Math.hypot(dx, dz);
        const min = c.r + 0.5;
        if (dist < min && dist > 0.001) {
          this.playerPos.x = c.x + (dx / dist) * min;
          this.playerPos.z = c.z + (dz / dist) * min;
        }
      }
      this.facing = Math.atan2(dir.x, dir.z);
      this.player.phase += dt * (this.running ? 13 : 8);
      if (!this.low && Math.random() < dt * 1.5) this.emitStep();
    }
    const targetRot = this.facing;
    let delta = targetRot - this.player.root.rotation.y;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    this.player.root.rotation.y += delta * Math.min(1, dt * 12);

    this.playerVelY -= 21 * dt;
    this.playerPos.y += this.playerVelY * dt;
    if (this.playerPos.y <= 0) {
      this.playerPos.y = 0;
      this.playerVelY = 0;
      this.grounded = true;
    }
    this.player.root.position.copy(this.playerPos);
    const swing = moving ? Math.sin(this.player.phase) * (this.running ? 0.85 : 0.55) : 0;
    this.player.legL.rotation.x = swing;
    this.player.legR.rotation.x = -swing;
    this.player.armL.rotation.x = -swing * 0.85;
    this.player.armR.rotation.x = swing * 0.85;
    this.player.torso.position.y = 1.02 + (moving ? Math.abs(Math.sin(this.player.phase)) * 0.035 : Math.sin(performance.now() / 800) * 0.012);
    this.player.root.position.y = this.playerPos.y + (moving ? Math.abs(Math.sin(this.player.phase * 2)) * 0.03 : 0);
    if (!this.grounded) {
      this.player.legL.rotation.x = 0.5;
      this.player.legR.rotation.x = -0.3;
      this.player.armL.rotation.x = -0.9;
      this.player.armR.rotation.x = -0.9;
    }
  }

  private emitStep() {
    // light visual feedback only, audio handled by React layer
  }

  private updateHanif(dt: number) {
    if (!this.hanif) return;
    const target = new THREE.Vector3(this.playerPos.x - Math.sin(this.facing) * 1.8 + 0.7, 0, this.playerPos.z - Math.cos(this.facing) * 1.8);
    const dist = this.hanif.root.position.distanceTo(target);
    if (dist > 12) {
      this.hanif.root.position.set(this.playerPos.x + 1.2, 0, this.playerPos.z + 1.2);
    } else if (dist > 1.6) {
      this.hanif.root.position.lerp(target, Math.min(1, dt * 2.2));
    }
    const hanifHit = this.interactables.find((i) => i.kind === 'hanif');
    if (hanifHit) {
      hanifHit.pos.set(this.hanif.root.position.x, 0, this.hanif.root.position.z);
    }
    const toPlayer = new THREE.Vector3().subVectors(this.playerPos, this.hanif.root.position);
    this.hanif.root.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
    const moving = dist > 1.8;
    this.hanif.phase += dt * (moving ? 6 : 1.6);
    const swing = moving ? Math.sin(this.hanif.phase) * 0.4 : 0;
    this.hanif.legL.rotation.x = swing;
    this.hanif.legR.rotation.x = -swing;
    this.hanif.armL.rotation.x = -swing * 0.7;
    this.hanif.torso.rotation.z = Math.sin(performance.now() / 900) * 0.02;
    this.hanif.root.position.y = Math.abs(Math.sin(performance.now() / 700)) * 0.015;
    this.sparkles.forEach((s) => {
      s.mesh.rotation.y += dt * s.speed;
      s.mesh.position.y = s.base + Math.sin(performance.now() / 700 + s.base) * 0.1;
    });
    if (this.heroNpc) {
      this.heroNpc.torso.rotation.y = Math.sin(performance.now() / 1600) * 0.06;
      this.heroNpc.armR.rotation.z = Math.sin(performance.now() / 1500) * 0.05;
    }
  }

  private updateNear(now: number) {
    const t = this.closestInteractable();
    const id = t ? t.id : null;
    if (id !== this.nearId) {
      this.nearId = id;
      this.callbacks.onNear(t ? { id: t.id, kind: t.kind, label: t.label, itemId: t.itemId } : null);
    }
    if (now - this.lastPosReport > 260) {
      this.lastPosReport = now;
      this.callbacks.onPosition({ x: this.playerPos.x, z: this.playerPos.z });
    }
  }

  private animate = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const now = performance.now();
    if (!document.hidden) {
      this.updatePlayer(dt);
      this.updateHanif(dt);
      this.orbit.update(dt, this.playerPos, this.facing);
      this.updateNear(now);
      if (this.atmosphere) this.atmosphere.rotation.y += dt * 0.01;
      if (this.beacon) this.beacon.rotation.y += dt * 0.4;
      if (this.flags.length) {
        const t = now / 1000;
        this.flags.forEach((f) => {
          const pos = f.mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let i = 0; i < pos.count; i++) {
            const x = f.base[i * 3];
            const y = f.base[i * 3 + 1];
            const factor = (x + 1.05) / 2.1;
            pos.setZ(i, Math.sin(x * 1.8 + t * 2.2 + f.phase) * 0.16 * factor + Math.sin(y * 2 + t) * 0.02);
          }
          pos.needsUpdate = true;
        });
      }
      this.sparkles.forEach((s) => {
        s.mesh.rotation.y += dt;
      });
      this.renderer.render(this.scene, this.camera);
    }
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.cleanupInputs();
    this.orbit.dispose();
    this.resizeObserver?.disconnect();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
