
import * as THREE from 'three';
import { TextureGenerator } from '../generation/TextureGenerator';

export class MaterialLibrary {
    private static cache: Record<string, THREE.Material> = {};

    public static get(key: string): THREE.Material {
        if (this.cache[key]) {
            return this.cache[key];
        }

        console.log(`[MaterialLibrary] Generatiing: ${key}`);
        let mat: THREE.Material;

        switch(key) {
            case 'Floor_Stone':
                const texFloor = TextureGenerator.generateBricks(512, 512, '#333333', '#111111');
                texFloor.repeat.set(4, 4);
                mat = new THREE.MeshStandardMaterial({ 
                    map: texFloor,
                    roughness: 0.9,
                    metalness: 0.1
                });
                break;

            case 'Wall_Crypt':
                const texWall = TextureGenerator.generateNoise(256, 256, '#2a2a2a');
                mat = new THREE.MeshStandardMaterial({
                    map: texWall,
                    roughness: 0.8
                });
                break;

            case 'Lava_Flow':
                const texLava = TextureGenerator.generateNoise(128, 128, '#ff4400', 50);
                mat = new THREE.MeshBasicMaterial({
                    map: texLava,
                    color: 0xffaa00
                });
                break;

            case 'Debug_Error':
                const texErr = TextureGenerator.generateCheckerboard();
                mat = new THREE.MeshBasicMaterial({ map: texErr });
                break;

            default:
                console.warn(`[MaterialLibrary] Unknown key: ${key}, returning fallback.`);
                mat = this.get('Debug_Error');
        }

        this.cache[key] = mat;
        return mat;
    }
}
