
import * as THREE from 'three';
import { TexturePainter } from './TexturePainter';

export class DungeonGen {
    public static build(scene: THREE.Scene): { width: number, height: number } {
        const size = 30; // 30x30 tiles
        
        // 1. Floor
        const floorTex = TexturePainter.getStone();
        floorTex.repeat.set(size/2, size/2); // Repeat texture
        const floorGeo = new THREE.PlaneGeometry(size, size);
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, 0);
        floor.receiveShadow = true;
        scene.add(floor);

        // 2. Walls (InstancedMesh)
        const wallTex = TexturePainter.getBricks();
        const wallGeo = new THREE.BoxGeometry(1, 2, 1);
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex });
        
        // Calculate Wall Count
        // Borders (4 * size) + Random internal blocks (~20%)
        const maxWalls = (size * 4) + Math.floor(size * size * 0.2);
        const walls = new THREE.InstancedMesh(wallGeo, wallMat, maxWalls);
        walls.castShadow = true;
        walls.receiveShadow = true;

        const dummy = new THREE.Object3D();
        let index = 0;

        const addWall = (x: number, z: number) => {
            dummy.position.set(x - size/2 + 0.5, 1, z - size/2 + 0.5);
            dummy.updateMatrix();
            walls.setMatrixAt(index++, dummy.matrix);
        };

        // Build Walls
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                // Edges
                if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
                    addWall(x, y);
                } 
                // Random Obstacles (Procedural)
                else if (Math.random() < 0.15 && !(x > 10 && x < 20 && y > 10 && y < 20)) {
                    // Keep center clear for spawn
                    addWall(x, y);
                }
            }
        }

        scene.add(walls);
        
        return { width: size, height: size };
    }
}
