
import { DungeonArchitect } from '../generation/DungeonArchitect';

export class CollisionSystem {
    
    /**
     * Checks if a world position is walkable.
     * Maps World Coordinate -> Grid Coordinate -> Tile Type.
     */
    public static canMove(x: number, z: number): boolean {
        const size = DungeonArchitect.MAP_SIZE;
        const tile = DungeonArchitect.TILE_SIZE;
        const offset = (size * tile) / 2;

        // Convert World to Grid
        const gx = Math.floor((x + offset) / tile);
        const gy = Math.floor((z + offset) / tile);

        // Bounds Check
        if (gx < 0 || gx >= size || gy < 0 || gy >= size) {
            return false;
        }

        // Tile Check (1 = Floor)
        // Corridors are also marked as 1 in DungeonArchitect
        if (DungeonArchitect.grid[gy] && DungeonArchitect.grid[gy][gx] === 1) {
            return true;
        }

        return false;
    }

    /**
     * Helper to get room at position (if any)
     */
    public static getRoomAt(x: number, z: number) {
        // Implementation for room-specific logic (e.g. Boss triggers)
        // Omitted for simple collision
        return null;
    }
}
