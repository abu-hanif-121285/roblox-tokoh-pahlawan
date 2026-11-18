import * as THREE from 'three';

const TAU = Math.PI * 2;
const HOME_PITCH = 0.43;
const HOME_DISTANCE = 6.4;
const EYE_HEIGHT = 1.36;
const MIN_DISTANCE = 3;
const MAX_DISTANCE = 12;

export interface CameraView {
  heading: number;
  touring: boolean;
}

/** A player-centred orbit. Yaw is continuous: only the compass display wraps. */
export class ExplorerOrbit {
  private yaw = 0;
  private targetYaw = 0;
  private pitch = HOME_PITCH;
  private targetPitch = HOME_PITCH;
  private targetDistance = HOME_DISTANCE;
  private distance = HOME_DISTANCE;
  private safeDistance = HOME_DISTANCE;
  private facing = 0;
  private enabled = true;
  private turnKeys = new Set<string>();
  private tour: { start: number; seconds: number } | null = null;
  private focus = new THREE.Vector3();
  private targetFocus = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private right = new THREE.Vector3();
  private up = new THREE.Vector3();
  private origin = new THREE.Vector3();
  private ray = new THREE.Raycaster();
  private hits: THREE.Intersection[] = [];
  private solids: { mesh: THREE.Mesh; bounds: THREE.Box3 }[] = [];
  private nearby: THREE.Mesh[] = [];
  private listeners = new Set<(view: CameraView) => void>();
  private view: CameraView = { heading: 0, touring: false };
  private publishTime = 0;
  private releasePointers = () => {};
  private removeListeners = () => {};

  constructor(private camera: THREE.PerspectiveCamera) {}

  get azimuth() { return this.yaw; }

  subscribe(listener: (view: CameraView) => void) {
    this.listeners.add(listener);
    listener(this.view);
    return () => { this.listeners.delete(listener); };
  }

  private publish(force = false) {
    const heading = Math.round(THREE.MathUtils.euclideanModulo(-this.yaw, TAU) * 180 / Math.PI) % 360;
    const touring = this.tour !== null;
    if (!force && heading === this.view.heading && touring === this.view.touring) return;
    this.view = { heading, touring };
    this.listeners.forEach((listener) => listener(this.view));
  }

  /** Cache the static scenery, never the player, companion, labels or quest markers. */
  setEnvironment(scene: THREE.Object3D) {
    scene.updateMatrixWorld(true);
    this.solids.length = 0;
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      if (!materials.some((m) => !m.transparent && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial)) return;
      if (['PlaneGeometry', 'CircleGeometry', 'TorusGeometry'].includes(mesh.geometry.type)) return;
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const bounds = mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
      if (bounds.max.y - bounds.min.y < 0.24) return;
      this.solids.push({ mesh, bounds });
    });
  }

  reset(position: THREE.Vector3, facing: number) {
    this.stopTour();
    this.facing = facing;
    this.targetYaw = this.yaw = facing + Math.PI;
    this.targetPitch = this.pitch = HOME_PITCH;
    this.targetDistance = this.distance = this.safeDistance = HOME_DISTANCE;
    this.focus.copy(position).y += EYE_HEIGHT;
    this.placeCamera(1);
    this.publish(true);
  }

  setPaused(paused: boolean) {
    this.enabled = !paused;
    if (paused) {
      this.clearInput();
      // Freeze immediately; do not finish a gesture behind a dialogue.
      this.targetYaw = this.yaw;
      this.targetPitch = this.pitch;
      this.targetDistance = this.distance;
    }
  }

  private clearInput() {
    this.turnKeys.clear();
    this.releasePointers();
    this.stopTour();
  }

  private stopTour() {
    if (!this.tour) return;
    this.tour = null;
    this.targetYaw = this.yaw;
    this.publish(true);
  }

  /** Positive degrees turn the view clockwise on the compass. */
  turn(degrees: number) {
    if (!this.enabled) return;
    this.stopTour();
    this.targetYaw -= THREE.MathUtils.degToRad(degrees);
  }

  recenter() {
    if (!this.enabled) return;
    this.stopTour();
    const delta = this.facing + Math.PI - this.yaw;
    // Use the nearest equivalent angle, even after several full revolutions.
    this.targetYaw = this.yaw + Math.atan2(Math.sin(delta), Math.cos(delta));
    this.targetPitch = HOME_PITCH;
    this.targetDistance = HOME_DISTANCE;
  }

  toggleTour() {
    if (!this.enabled) return;
    if (this.tour) return this.stopTour();
    this.tour = { start: this.yaw, seconds: 0 };
    this.targetYaw = this.yaw;
    this.publish(true);
  }

  connect(canvas: HTMLCanvasElement) {
    this.removeListeners();
    const pointers = new Map<number, { x: number; y: number }>();
    const span = () => {
      const [a, b] = pointers.values();
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';
    canvas.setAttribute('aria-label', 'Dunia 3D. Seret untuk mengorbit karakter 360 derajat.');
    const down = (event: PointerEvent) => {
      if (!this.enabled || pointers.size >= 2 || (event.pointerType === 'mouse' && event.button !== 0 && event.button !== 2)) return;
      event.preventDefault();
      this.stopTour();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    };
    const move = (event: PointerEvent) => {
      const point = pointers.get(event.pointerId);
      if (!this.enabled || !point) return;
      event.preventDefault();
      const oldSpan = pointers.size === 2 ? span() : 0;
      const dx = event.clientX - point.x;
      const dy = event.clientY - point.y;
      point.x = event.clientX;
      point.y = event.clientY;
      if (pointers.size === 2) {
        const newSpan = span();
        if (oldSpan > 6 && newSpan > 6) {
          this.targetDistance = THREE.MathUtils.clamp(this.targetDistance * oldSpan / newSpan, MIN_DISTANCE, MAX_DISTANCE);
        }
      } else {
        // One viewport-width drag is one revolution on any screen size.
        this.targetYaw -= dx * TAU / Math.max(1, canvas.clientWidth);
        this.targetPitch = THREE.MathUtils.clamp(this.targetPitch + dy * 2.1 / Math.max(1, canvas.clientHeight), -0.18, 1.37);
      }
    };
    const up = (event: PointerEvent) => {
      if (!pointers.delete(event.pointerId)) return;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (!pointers.size) canvas.style.cursor = 'grab';
    };
    this.releasePointers = () => {
      for (const id of pointers.keys()) {
        if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
      }
      pointers.clear();
      canvas.style.cursor = 'grab';
    };
    const wheel = (event: WheelEvent) => {
      if (!this.enabled) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
      const delta = THREE.MathUtils.clamp(event.deltaY * unit, -160, 160);
      this.targetDistance = THREE.MathUtils.clamp(this.targetDistance * Math.exp(delta * 0.0015), MIN_DISTANCE, MAX_DISTANCE);
    };
    const keydown = (event: KeyboardEvent) => {
      if (!this.enabled || event.ctrlKey || event.metaKey || event.altKey) return;
      if ((event.target as HTMLElement | null)?.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (event.code === 'KeyJ' || event.code === 'KeyL') {
        event.preventDefault();
        this.stopTour();
        this.turnKeys.add(event.code);
      }
      if (event.code === 'KeyC' && !event.repeat) {
        event.preventDefault();
        this.recenter();
      }
    };
    const keyup = (event: KeyboardEvent) => { this.turnKeys.delete(event.code); };
    const blur = () => this.clearInput();
    const visibility = () => { if (document.hidden) blur(); };
    const context = (event: Event) => event.preventDefault();
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('lostpointercapture', up);
    canvas.addEventListener('wheel', wheel, { passive: false });
    canvas.addEventListener('contextmenu', context);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);
    this.removeListeners = () => {
      this.clearInput();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('lostpointercapture', up);
      canvas.removeEventListener('wheel', wheel);
      canvas.removeEventListener('contextmenu', context);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', visibility);
    };
  }

  update(dt: number, position: THREE.Vector3, facing: number) {
    if (!this.enabled) return;
    this.facing = facing;
    const keyTurn = Number(this.turnKeys.has('KeyL')) - Number(this.turnKeys.has('KeyJ'));
    this.targetYaw -= keyTurn * dt * 1.85;
    if (this.tour) {
      this.tour.seconds += dt;
      const t = Math.min(1, this.tour.seconds / 5);
      this.yaw = this.targetYaw = this.tour.start - TAU * t * t * (3 - 2 * t);
      if (t === 1) { this.tour = null; this.publish(true); }
    }
    const blend = 1 - Math.exp(-18 * dt);
    this.yaw += (this.targetYaw - this.yaw) * blend;
    this.pitch += (this.targetPitch - this.pitch) * blend;
    this.distance += (this.targetDistance - this.distance) * blend;
    this.targetFocus.copy(position).y += EYE_HEIGHT;
    this.focus.lerp(this.targetFocus, 1 - Math.exp(-24 * dt));
    this.placeCamera(dt);
    this.publishTime += dt;
    if (this.publishTime >= 0.085) { this.publishTime = 0; this.publish(); }
  }

  private placeCamera(dt: number) {
    this.direction.set(Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch));
    this.right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    this.up.crossVectors(this.direction, this.right);
    this.nearby.length = 0;
    for (const solid of this.solids) {
      if (solid.bounds.distanceToPoint(this.focus) <= this.distance + 0.5) this.nearby.push(solid.mesh);
    }
    let limit = this.distance;
    if (this.direction.y < 0) limit = Math.min(limit, (this.focus.y - 0.32) / -this.direction.y);
    // Sample the centre and edges of the near plane, not just the lens centre.
    // Obstructions pull the camera in immediately; it eases outward when clear.
    const padding = Math.max(0.22, this.camera.near * Math.tan(this.camera.fov * Math.PI / 360) * this.camera.aspect + 0.08);
    if (this.nearby.length) {
      for (let i = 0; i < 5; i++) {
        this.origin.copy(this.focus);
        if (i === 1 || i === 2) this.origin.addScaledVector(this.right, i === 1 ? padding : -padding);
        if (i === 3 || i === 4) this.origin.addScaledVector(this.up, i === 3 ? padding : -padding);
        this.ray.set(this.origin, this.direction);
        this.ray.far = limit + padding;
        this.hits.length = 0;
        this.ray.intersectObjects(this.nearby, false, this.hits);
        if (this.hits.length) limit = Math.min(limit, Math.max(0.2, this.hits[0].distance - padding));
      }
    }
    this.safeDistance = Math.min(limit, this.safeDistance + (limit - this.safeDistance) * (1 - Math.exp(-8 * dt)));
    this.camera.position.copy(this.focus).addScaledVector(this.direction, this.safeDistance);
    this.camera.lookAt(this.focus);
  }

  dispose() {
    this.removeListeners();
    this.listeners.clear();
    this.solids.length = this.nearby.length = this.hits.length = 0;
  }
}
