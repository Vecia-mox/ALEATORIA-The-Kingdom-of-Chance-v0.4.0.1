
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MaterialLibrary } from '../graphics/MaterialLibrary';

export class AssetLoader {
    private static instance: AssetLoader;
    private loader = new GLTFLoader();

    private constructor() {}

    public static getInstance(): AssetLoader {
        if (!AssetLoader.instance) {
            AssetLoader.instance = new AssetLoader();
        }
        return AssetLoader.instance;
    }

    /**
     * Loads a GLB model from the public/assets directory.
     * @param filename e.g., 'barbarian_t1.glb'
     */
    public async loadModel(filename: string): Promise<THREE.Group> {
        return new Promise((resolve, reject) => {
            const path = filename.startsWith('assets') || filename.startsWith('/') 
                ? filename 
                : `/assets/${filename}`;
            console.log(`[AssetLoader] Fetching: ${path}`);

            this.loader.load(
                path, 
                (gltf) => {
                    console.log(`✅ Loaded: ${filename}`);
                    resolve(gltf.scene);
                }, 
                undefined, 
                (err) => {
                    console.warn(`⚠️ FAILED: ${filename}. Generating Placeholder.`);
                    
                    // Fallback: Use Procedural Assets
                    const group = new THREE.Group();
                    
                    // Create a "Stand-in" Character
                    const geometry = new THREE.CapsuleGeometry(0.5, 1.8, 4, 8);
                    const material = MaterialLibrary.get('Debug_Error'); // Checkerboard
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.y = 0.9; // Feet on ground
                    
                    group.add(mesh);
                    
                    // Resolve with fallback so game continues
                    resolve(group);
                }
            );
        });
    }

    public static loadModel(filename: string): Promise<THREE.Group> {
        return AssetLoader.getInstance().loadModel(filename);
    }

    public async loadModelLOD(filename: string, lodLevel: number): Promise<THREE.Group> {
        return this.loadModel(filename);
    }

    public async loadAsset(url: string, type: 'MODEL' | 'TEXTURE'): Promise<any> {
        if (type === 'MODEL') return this.loadModel(url);
        return null;
    }

    public streamTexture(gl: WebGL2RenderingContext, url: string): WebGLTexture | null {
        console.warn("[AssetLoader] streamTexture not implemented in base loader");
        return null;
    }
}
