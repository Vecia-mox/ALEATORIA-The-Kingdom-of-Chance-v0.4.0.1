
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export class PostProcessing {
    private static composer: EffectComposer;

    public static init(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        // 1. Setup Composer
        this.composer = new EffectComposer(renderer);
        
        // 2. Base Scene Pass
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // 3. Unreal Bloom Pass (Fire Glow)
        // Adjusted for stricter glow (only very bright things)
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2,  // Strength (Moderate)
            0.3,  // Radius (Tight)
            0.95  // Threshold (Only things > 95% brightness glow)
        );
        this.composer.addPass(bloomPass);
    }

    public static resize(width: number, height: number) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    public static render() {
        if (this.composer) {
            this.composer.render();
        }
    }
}
