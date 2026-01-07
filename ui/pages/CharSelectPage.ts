
import * as THREE from 'three';
import { AssetLoader } from '../../engine/assets/AssetLoader';
import { MaterialLibrary } from '../../engine/graphics/MaterialLibrary';

/**
 * PHASE 2: CHARACTER SELECTION (Three.js Version)
 * Renders the high-fidelity character model with lighting.
 */
export class CharSelectPage {
  private parent: HTMLElement;
  private onSelect: () => void;
  private active: boolean = true;
  
  // Three.js
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private pivot: THREE.Group;

  constructor(parent: HTMLElement, onSelect: () => void) {
    this.parent = parent;
    this.onSelect = onSelect;
  }

  public render() {
    this.parent.innerHTML = '';
    
    // 1. Container
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.background = 'radial-gradient(circle at center, #1a0b2e 0%, #000000 100%)';
    this.parent.appendChild(container);

    // 2. Setup Scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.5, 4);
    this.camera.lookAt(0, 1.0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);

    // 3. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    const keyLight = new THREE.SpotLight(0xffaa00, 10.0);
    keyLight.position.set(2, 5, 3);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const rimLight = new THREE.SpotLight(0x4444ff, 15.0);
    rimLight.position.set(-2, 3, -4);
    this.scene.add(rimLight);

    // 4. Load Character
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    console.log("Attempting to load barbarian_t1.glb...");
    AssetLoader.loadModel('barbarian_t1.glb').then(model => {
        if (!this.active) return;
        
        model.scale.set(1, 1, 1);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // Center at pivot
        model.position.y = 0; // Feet at floor

        this.pivot.add(model);
    });

    // 5. Floor (Procedural)
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = MaterialLibrary.get('Floor_Stone'); // Use procedural material
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // 6. UI Overlay
    this.createUI(container);

    // 7. Animation Loop
    const animate = () => {
        if (!this.active) return;
        requestAnimationFrame(animate);
        
        // Idle rotation
        if (this.pivot) this.pivot.rotation.y += 0.005;

        this.renderer.render(this.scene, this.camera);
    };
    animate();

    window.addEventListener('resize', this.onResize);
  }

  private createUI(container: HTMLElement) {
      const ui = document.createElement('div');
      ui.style.cssText = "position:absolute; bottom:0; left:0; width:100%; height:150px; display:flex; justify-content:center; align-items:center; pointer-events:none;";
      
      const btn = document.createElement('button');
      btn.innerText = "BEGIN JOURNEY";
      btn.style.cssText = "padding: 15px 50px; font-family:serif; font-weight:bold; font-size:18px; color:black; background:#fbbf24; border:2px solid white; pointer-events:auto; cursor:pointer;";
      
      btn.onclick = () => {
          this.active = false;
          this.onSelect();
      };

      ui.appendChild(btn);
      container.appendChild(ui);
  }

  private onResize = () => {
      if (!this.active) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
