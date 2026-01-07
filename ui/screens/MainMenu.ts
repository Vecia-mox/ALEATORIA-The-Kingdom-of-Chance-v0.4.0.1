
import * as THREE from 'three';
import { AssetLoader } from '../../engine/assets/AssetLoader';
import { MaterialLibrary } from '../../engine/graphics/MaterialLibrary';
import { HeroModel } from '../../engine/graphics/HeroModel';
import { SaveManager } from '../../engine/core/SaveManager';
import { App } from '../../engine/core/App';

export class MainMenu {
    private container: HTMLElement;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private heroPivot: THREE.Group;
    private animationId: number;
    private active: boolean = true;

    constructor(parent: HTMLElement) {
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: #000;
        `;
        parent.appendChild(this.container);
        
        this.init3D();
        this.initUI();
    }

    private init3D() {
        // Scene Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.FogExp2(0x050505, 0.05);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.5, 4.5);
        this.camera.lookAt(0, 1.0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const spot = new THREE.SpotLight(0xffaa00, 10);
        spot.position.set(2, 5, 3);
        spot.castShadow = true;
        this.scene.add(spot);

        const fill = new THREE.PointLight(0x4444ff, 2);
        fill.position.set(-2, 2, -2);
        this.scene.add(fill);

        // Floor
        const floorGeo = new THREE.PlaneGeometry(20, 20);
        const floorMat = MaterialLibrary.get('Floor_Stone');
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Hero
        this.heroPivot = new THREE.Group();
        const heroModel = new HeroModel();
        heroModel.equip('Iron Sword');
        
        // Pose
        heroModel.rightArm.rotation.x = -0.5;
        heroModel.rightArm.rotation.z = 0.5;
        heroModel.leftArm.rotation.x = 0.2;
        heroModel.head.rotation.y = -0.2;

        this.heroPivot.add(heroModel.mesh);
        this.scene.add(this.heroPivot);

        // Loop
        const animate = () => {
            if (!this.active) return;
            this.animationId = requestAnimationFrame(animate);
            this.heroPivot.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;
            this.renderer.render(this.scene, this.camera);
        };
        animate();

        window.addEventListener('resize', this.onResize);
    }

    private initUI() {
        const ui = document.createElement('div');
        ui.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            pointer-events: none;
        `;

        const title = document.createElement('h1');
        title.innerHTML = "ALEATORIA<br><span style='font-size:20px; letter-spacing:10px; color:#666'>KINGDOM OF CHANCE</span>";
        title.style.cssText = `
            color: #fbbf24; font-family: 'Cinzel', serif; font-size: 64px; 
            text-shadow: 0 0 30px #b45309; text-align: center; margin-bottom: 60px;
            animation: float 4s ease-in-out infinite;
        `;
        ui.appendChild(title);

        const btnStyle = `
            pointer-events: auto; cursor: pointer;
            background: rgba(0,0,0,0.8); border: 2px solid #444;
            color: #ccc; font-family: 'Cinzel', serif; font-size: 24px;
            padding: 15px 60px; margin: 10px; transition: all 0.2s;
            width: 300px; text-align: center;
        `;

        // Buttons Container
        const btns = document.createElement('div');
        btns.style.pointerEvents = 'auto';

        if (SaveManager.hasSave()) {
            const continueBtn = document.createElement('button');
            continueBtn.innerText = "CONTINUE";
            continueBtn.style.cssText = btnStyle + "border-color: #10b981; color: #10b981;";
            continueBtn.onmouseover = () => continueBtn.style.background = "#064e3b";
            continueBtn.onmouseout = () => continueBtn.style.background = "rgba(0,0,0,0.8)";
            continueBtn.onclick = () => this.startGame(true);
            btns.appendChild(continueBtn);
        }

        const newGameBtn = document.createElement('button');
        newGameBtn.innerText = "NEW GAME";
        newGameBtn.style.cssText = btnStyle;
        newGameBtn.onmouseover = () => { newGameBtn.style.borderColor = "#fbbf24"; newGameBtn.style.color = "#fbbf24"; };
        newGameBtn.onmouseout = () => { newGameBtn.style.borderColor = "#444"; newGameBtn.style.color = "#ccc"; };
        newGameBtn.onclick = () => {
            if (SaveManager.hasSave()) {
                if(confirm("This will overwrite your existing save. Are you sure?")) {
                    SaveManager.wipe();
                    this.startGame(false);
                }
            } else {
                this.startGame(false);
            }
        };
        btns.appendChild(newGameBtn);

        ui.appendChild(btns);
        this.container.appendChild(ui);
    }

    private startGame(load: boolean) {
        this.active = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onResize);
        
        // Fade Out
        this.container.style.transition = "opacity 1s";
        this.container.style.opacity = "0";
        
        setTimeout(() => {
            this.container.remove();
            App.startGame(load);
        }, 1000);
    }

    private onResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
