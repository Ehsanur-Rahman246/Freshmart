import * as THREE from "three";

/**
 * FarmScene
 * Encapsulates a small Three.js scene: five full-bleed panorama planes
 * stacked on the same axis (crossfaded via material opacity) viewed
 * through an OrthographicCamera. The camera's `.zoom` and `.position.x`
 * are plain numeric props, so GSAP can tween them directly — this class
 * just keeps the renderer in sync via a render-on-demand loop.
 */
export class FarmScene {
  constructor(canvas, frameUrls) {
    this.canvas = canvas;
    this.frameUrls = frameUrls;
    this.planes = [];
    this.disposed = false;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();

    this.frustumHeight = 10;
    this.camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
    this.camera.position.z = 10;
    this.camera.zoom = 1;

    this._loadTextures();
    this._raf = this._raf.bind(this);
  }

  _loadTextures() {
    const loader = new THREE.TextureLoader();
    this.frameUrls.forEach((url, i) => {
      const texture = loader.load(url, () => this._fitPlane(i));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: i === 0 ? 1 : 0,
        depthWrite: false,
        depthTest: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = -i * 0.01;
      mesh.renderOrder = this.frameUrls.length - i;
      mesh.userData.aspect = 1;
      this.scene.add(mesh);
      this.planes.push(mesh);
    });
  }

  _fitPlane(index) {
    const mesh = this.planes[index];
    const tex = mesh.material.map;
    const img = tex.image;
    if (!img || !img.width) return;
    mesh.userData.aspect = img.width / img.height;
    this._coverFit(mesh);
    this.requestRender();
  }

  _coverFit(mesh) {
    const aspect = mesh.userData.aspect || 1;
    const viewW = this.frustumWidth;
    const viewH = this.frustumHeight;
    const viewAspect = viewW / viewH;
    let w, h;
    if (aspect > viewAspect) {
      h = viewH;
      w = h * aspect;
    } else {
      w = viewW;
      h = w / aspect;
    }
    mesh.scale.set(w, h, 1);
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);

    const aspect = width / height;
    this.frustumWidth = this.frustumHeight * aspect;
    this.camera.left = -this.frustumWidth / 2;
    this.camera.right = this.frustumWidth / 2;
    this.camera.top = this.frustumHeight / 2;
    this.camera.bottom = -this.frustumHeight / 2;
    this.camera.updateProjectionMatrix();

    this.planes.forEach((mesh) => this._coverFit(mesh));
    this.requestRender();
  }

  setOpacity(index, value) {
    const mesh = this.planes[index];
    if (!mesh) return;
    mesh.material.opacity = value;
    mesh.visible = value > 0.001;
  }

  setCameraZoom(zoom) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
  }

  setCameraX(x) {
    this.camera.position.x = x;
  }

  requestRender() {
    if (this._pending || this.disposed) return;
    this._pending = true;
    requestAnimationFrame(this._raf);
  }

  _raf() {
    this._pending = false;
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  update() {
    this.requestRender();
  }

  dispose() {
    this.disposed = true;
    this.planes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.map?.dispose();
      mesh.material.dispose();
    });
    this.renderer.dispose();
  }
}

// ---------------------------------------------------------------------
// Scene data — placeholder copy, swap whenever real copy is ready.
// `align` controls where the bubble sits (SceneBubble handles mobile
// repositioning via responsive classes).
// ---------------------------------------------------------------------

export const FRAMES = [
  {
    id: "frame-1",
    src: "/assets/frame-1.jpg",
    eyebrow: "From above",
    title: "One farm. Every doorstep.",
    body: "A single family farm, run the way farming used to be run — and now reaching further than it ever could before.",
    align: "left",
  },
  {
    id: "frame-2",
    src: "/assets/frame-2.jpg",
    eyebrow: "The land",
    title: "Grown slow, picked ripe.",
    body: "No shortcuts in the soil. Every row gets the season it needs before anything leaves the field.",
    align: "right",
  },
  {
    id: "frame-3",
    src: "/assets/frame-3.jpg",
    eyebrow: "On the road",
    title: "Farm to your door, today.",
    body: "Same-day delivery from the field to your kitchen — cold-chain the whole way, so it's still farm-fresh when it lands.",
    align: "left",
  },
  {
    id: "frame-4",
    src: "/assets/frame-4.jpg",
    eyebrow: "The promise",
    title: "Nothing sits in a warehouse.",
    body: "We harvest against real orders, not forecasts. What you get was still growing a day or two ago.",
    align: "right",
  },
  {
    id: "frame-5",
    src: "/assets/frame-5.jpg",
    eyebrow: "Join us",
    title: "Taste where you live.",
    body: "Fresh Mart delivers across your city, every day of the week.",
    align: "center",
    cta: "Start your first order",
  },
];

export const CLOUD_LEFT = "/assets/cloud-1.png";
export const CLOUD_RIGHT = "/assets/cloud-2.png";
export const TRUCK = "/assets/truck.png";
