
import * as THREE from 'three';
import { DungeonArchitect } from '../generation/DungeonArchitect';

export class MapSystem {
    private static visited = new Set<string>();
    private static readonly TILE_SIZE = 4; // Matches DungeonArchitect
    private static readonly MAP_SIZE = 50; // Matches DungeonArchitect
    private static readonly VIEW_RADIUS = 3; // Tiles radius to uncover

    public static init() {
        this.visited.clear();
    }

    /**
     * Uncovers tiles around the player's position.
     */
    public static explore(pos: THREE.Vector3) {
        // Convert world position to grid coordinates
        // Center of map is (0,0) world -> (25, 25) grid
        const offset = (this.MAP_SIZE * this.TILE_SIZE) / 2;
        
        const gx = Math.floor((pos.x + offset) / this.TILE_SIZE);
        const gy = Math.floor((pos.z + offset) / this.TILE_SIZE);

        for (let y = -this.VIEW_RADIUS; y <= this.VIEW_RADIUS; y++) {
            for (let x = -this.VIEW_RADIUS; x <= this.VIEW_RADIUS; x++) {
                const checkX = gx + x;
                const checkY = gy + y;
                
                // Circle check for smoother reveal
                if (x*x + y*y <= this.VIEW_RADIUS * this.VIEW_RADIUS) {
                     if (checkX >= 0 && checkX < this.MAP_SIZE && checkY >= 0 && checkY < this.MAP_SIZE) {
                        this.visited.add(`${checkX},${checkY}`);
                     }
                }
            }
        }
    }

    public static isExplored(gridX: number, gridY: number): boolean {
        return this.visited.has(`${gridX},${gridY}`);
    }

    /**
     * Converts a Grid Coordinate back to World Position (Top-Left of tile).
     */
    public static gridToWorld(gx: number, gy: number): { x: number, z: number } {
        const offset = (this.MAP_SIZE * this.TILE_SIZE) / 2;
        return {
            x: (gx * this.TILE_SIZE) - offset,
            z: (gy * this.TILE_SIZE) - offset
        };
    }
}
