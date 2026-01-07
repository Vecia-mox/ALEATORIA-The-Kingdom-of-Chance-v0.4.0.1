
import * as THREE from 'three';
import { TexturePainter } from './TexturePainter';
import { Shrine } from '../entities/Shrine';
import { BuffType } from '../combat/BuffManager';
import { DifficultyManager } from '../core/DifficultyManager';
import { ThemeManager } from './ThemeManager';
import { PropFactory } from './PropFactory';

export interface Room {
    x: number; // World X Center
    y: number; // World Z Center
    w: number; // Grid Width
    h: number; // Grid Height
}

export class DungeonArchitect {
    // PUBLIC STATIC ACCESS
    public static grid: number[][] = [];
    public static walls: THREE.Group;
    public static props: THREE.Group; // Container for dynamic props

    public static generate(scene: THREE.Scene): { rooms: Room[], width: number, height: number, walls: THREE.Group, shrines: Shrine[] } {
        const size = 50; // 50x50 Grid
        const TILE_SIZE = 4; // 4 Meters per tile
        
        const floorNum = DifficultyManager.getInstance().currentFloor;
        // ThemeManager.apply(scene, floorNum); 

        // Initialize Grid: 0=Void, 1=Floor, 2=Wall
        const newGrid = Array(size).fill(0).map(() => Array(size).fill(0));
        const rooms: Room[] = [];
        const shrines: Shrine[] = [];

        // 2. PLACE ROOMS
        let attempts = 0;
        while (rooms.length < 10 && attempts < 50) {
            attempts++;
            const w = 4 + Math.floor(Math.random() * 5); // 4-8 width
            const h = 4 + Math.floor(Math.random() * 5); // 4-8 height
            const gx = 2 + Math.floor(Math.random() * (size - w - 4));
            const gy = 2 + Math.floor(Math.random() * (size - h - 4));

            let overlap = false;
            for (let y = gy - 1; y < gy + h + 1; y++) {
                for (let x = gx - 1; x < gx + w + 1; x++) {
                    if (newGrid[y][x] !== 0) overlap = true;
                }
            }

            if (!overlap) {
                // Carve Room
                for (let y = gy; y < gy + h; y++) {
                    for (let x = gx; x < gx + w; x++) {
                        newGrid[y][x] = 1;
                    }
                }
                const centerX = (gx + w/2) * TILE_SIZE - (size * TILE_SIZE)/2;
                const centerZ = (gy + h/2) * TILE_SIZE - (size * TILE_SIZE)/2;
                rooms.push({ x: centerX, y: centerZ, w, h });

                // SHRINE CHANCE (30%)
                if (Math.random() < 0.3) {
                    const types: BuffType[] = ['FRENZY', 'SWIFTNESS', 'VITALITY'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    const shrine = new Shrine(scene, centerX, centerZ, type);
                    shrines.push(shrine);
                }
            }
        }

        // 3. CONNECT ROOMS
        for (let i = 0; i < rooms.length - 1; i++) {
            const rA = rooms[i];
            const rB = rooms[i+1];
            const xA = Math.floor((rA.x + (size * TILE_SIZE)/2) / TILE_SIZE);
            const yA = Math.floor((rA.y + (size * TILE_SIZE)/2) / TILE_SIZE);
            const xB = Math.floor((rB.x + (size * TILE_SIZE)/2) / TILE_SIZE);
            const yB = Math.floor((rB.y + (size * TILE_SIZE)/2) / TILE_SIZE);

            const minX = Math.min(xA, xB);
            const maxX = Math.max(xA, xB);
            for (let x = minX; x <= maxX; x++) newGrid[yA][x] = 1;

            const minY = Math.min(yA, yB);
            const maxY = Math.max(yA, yB);
            for (let y = minY; y <= maxY; y++) newGrid[y][xB] = 1;
        }

        // 4. GENERATE MESHES
        this.walls = new THREE.Group();
        this.props = new THREE.Group(); // New Prop Container

        const wallGeo = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE * 2, TILE_SIZE);
        
        // WALL MATERIAL (UPDATED VISIBILITY - Lighter Brick)
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: 0xAA6666, // Lighter Brick Red
            roughness: 0.5,  // Reflects more light
            metalness: 0.1,
            flatShading: true 
        });
        
        // FLOOR MATERIAL (Procedural Noise Variation)
        const floorGeo = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
        
        const floorGroup = new THREE.Group();

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const worldX = x * TILE_SIZE - (size * TILE_SIZE)/2;
                const worldZ = y * TILE_SIZE - (size * TILE_SIZE)/2;

                if (newGrid[y][x] === 1) {
                    // FLOOR GENERATION
                    const isDark = Math.random() > 0.5;
                    const tileColor = isDark ? 0x111111 : 0x1a1a1a; // Subtle checkerboard
                    
                    const mat = new THREE.MeshStandardMaterial({ 
                        color: tileColor, 
                        roughness: 0.8,
                        metalness: 0.2
                    });

                    const floor = new THREE.Mesh(floorGeo, mat);
                    floor.rotation.x = -Math.PI/2;
                    floor.position.set(worldX, 0, worldZ);
                    floor.receiveShadow = true; 
                    floorGroup.add(floor);
                } else {
                    let touchFloor = false;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (y+dy >= 0 && y+dy < size && x+dx >= 0 && x+dx < size) {
                                if (newGrid[y+dy][x+dx] === 1) touchFloor = true;
                            }
                        }
                    }
                    if (touchFloor) {
                        newGrid[y][x] = 2; 
                        const wall = new THREE.Mesh(wallGeo, wallMat);
                        wall.position.set(worldX, TILE_SIZE, worldZ);
                        wall.castShadow = true;
                        wall.receiveShadow = true;
                        this.walls.add(wall);
                    }
                }
            }
        }

        // 5. PROP SCATTERING
        rooms.forEach(room => {
            // Iterate room area with step of 2 meters (0.5 tile)
            const roomMinX = room.x - (room.w * TILE_SIZE) / 2;
            const roomMaxX = room.x + (room.w * TILE_SIZE) / 2;
            const roomMinZ = room.y - (room.h * TILE_SIZE) / 2;
            const roomMaxZ = room.y + (room.h * TILE_SIZE) / 2;

            for (let px = roomMinX + 1; px < roomMaxX - 1; px += 2) {
                for (let pz = roomMinZ + 1; pz < roomMaxZ - 1; pz += 2) {
                    // Check Center Distance (Keep path clear)
                    const dist = Math.sqrt(Math.pow(px - room.x, 2) + Math.pow(pz - room.y, 2));
                    if (dist < 4.0) continue; // 4m clear zone in center

                    // Spawn Chance
                    const roll = Math.random();
                    let prop: THREE.Object3D | null = null;

                    if (roll > 0.96) {
                        prop = PropFactory.createBarrel(px, pz);
                    } else if (roll > 0.92) {
                        prop = PropFactory.createCrate(px, pz);
                    } else if (roll > 0.85) {
                        prop = PropFactory.createRubble(px, pz);
                    }

                    if (prop) {
                        // Jitter position slightly
                        prop.position.x += (Math.random() - 0.5) * 0.5;
                        prop.position.z += (Math.random() - 0.5) * 0.5;
                        this.props.add(prop);
                    }
                }
            }
        });

        // 6. PILLAR GENERATION (Shadow Casters) - existing logic
        rooms.forEach(room => {
            if (room.w >= 4 && room.h >= 4) { 
                const quadrantW = (room.w * TILE_SIZE) / 2;
                const quadrantH = (room.h * TILE_SIZE) / 2;
                const offsets = [
                    { x: -quadrantW/2, z: -quadrantH/2 },
                    { x: quadrantW/2, z: -quadrantH/2 },
                    { x: -quadrantW/2, z: quadrantH/2 },
                    { x: quadrantW/2, z: quadrantH/2 }
                ];
                offsets.forEach(off => {
                    if (Math.random() > 0.6) { // Reduced chance to avoid clutter with props
                        const pillarGeo = new THREE.BoxGeometry(TILE_SIZE * 0.8, TILE_SIZE * 3, TILE_SIZE * 0.8);
                        const pillar = new THREE.Mesh(pillarGeo, wallMat); 
                        pillar.position.set(room.x + off.x, TILE_SIZE * 1.5, room.y + off.z);
                        pillar.castShadow = true;
                        pillar.receiveShadow = true;
                        this.walls.add(pillar);
                    }
                });
            }
        });

        scene.add(floorGroup);
        scene.add(this.walls);
        scene.add(this.props); // Add props to scene
        this.grid = newGrid;

        return { rooms, width: size, height: size, walls: this.walls, shrines };
    }
}
