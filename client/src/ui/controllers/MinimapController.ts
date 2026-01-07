
import * as THREE from 'three';
import { MapSystem } from '../../engine/systems/MapSystem';
import { DungeonArchitect } from '../../engine/generation/DungeonArchitect';
import { GameDirector } from '../../engine/core/GameDirector';

export class MinimapController {
    private static ctx: CanvasRenderingContext2D | null = null;
    private static readonly SCALE = 6; // Pixels per World Meter
    private static readonly RADIUS = 75; // Canvas Radius

    public static init(grid: number[][], size: number) {
        let container = document.getElementById('minimap-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'minimap-container';
            // Styling handled in CSS, but ensure size matches logic
            container.style.width = '150px';
            container.style.height = '150px';
            document.body.appendChild(container);
        }

        let canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'minimap-canvas';
            container.appendChild(canvas);
        }
        
        canvas.width = 150;
        canvas.height = 150;
        MinimapController.ctx = canvas.getContext('2d');
    }

    public static update(
        playerPos: THREE.Vector3, 
        playerRotY: number,
        grid: number[][], 
        enemies: THREE.Group[], 
        lootItems: any[]
    ) {
        const ctx = MinimapController.ctx;
        if (!ctx) return;

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        // 1. CLEAR
        ctx.clearRect(0, 0, w, h);
        
        // 2. MASK (Circular)
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, this.RADIUS, 0, Math.PI * 2);
        ctx.clip();

        // Background (Semi-Transparent)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fill();

        // 3. TRANSFORM WORLD TO PLAYER-CENTRIC
        // Move Origin to Center
        ctx.translate(cx, cy);
        // Rotate World opposite to Player (so Player stays UP)
        ctx.rotate(playerRotY);
        // Move World so Player is at Origin (0,0)
        ctx.translate(-playerPos.x * this.SCALE, -playerPos.z * this.SCALE); // Z is 2D Y

        // 4. DRAW WORLD (Grid)
        // Optimization: Only draw tiles within view distance
        // View Dist = Radius / Scale = 75 / 6 ~= 12 meters
        const viewDist = 15;
        const TILE = DungeonArchitect.TILE_SIZE;
        const MAP_SIZE = DungeonArchitect.MAP_SIZE;
        const offset = (MAP_SIZE * TILE) / 2;

        const pGridX = Math.floor((playerPos.x + offset) / TILE);
        const pGridY = Math.floor((playerPos.z + offset) / TILE);
        const range = Math.ceil(viewDist / TILE) + 2;

        for (let y = -range; y <= range; y++) {
            for (let x = -range; x <= range; x++) {
                const gx = pGridX + x;
                const gy = pGridY + y;

                if (gx < 0 || gx >= MAP_SIZE || gy < 0 || gy >= MAP_SIZE) continue;
                if (!MapSystem.isExplored(gx, gy)) continue;

                const tile = grid[gy][gx];
                if (tile === 0) continue;

                // World Position of Tile
                const wx = gx * TILE - offset;
                const wz = gy * TILE - offset;

                // Draw Rect
                // Add 0.5 to size to prevent seams
                if (tile === 2) {
                    ctx.fillStyle = '#666'; // Wall
                } else {
                    ctx.fillStyle = '#222'; // Floor
                }
                ctx.fillRect(wx * this.SCALE, wz * this.SCALE, TILE * this.SCALE + 1, TILE * this.SCALE + 1);
            }
        }

        // 5. DRAW ENTITIES
        // Enemies
        ctx.fillStyle = '#ef4444';
        enemies.forEach(e => {
            if (e.userData.isDead) return;
            // Draw relative to world 0,0 (transform handles the rest)
            ctx.beginPath();
            ctx.arc(e.position.x * this.SCALE, e.position.z * this.SCALE, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Loot
        ctx.fillStyle = '#fbbf24';
        lootItems.forEach(i => {
            if (i.isCollected) return;
            ctx.beginPath();
            ctx.arc(i.mesh.position.x * this.SCALE, i.mesh.position.z * this.SCALE, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Portal
        if (GameDirector.portal && GameDirector.portal.mesh.visible) {
            const p = GameDirector.portal.mesh.position;
            ctx.fillStyle = '#00ff00';
            const s = 6;
            ctx.fillRect(p.x * this.SCALE - s/2, p.z * this.SCALE - s/2, s, s);
        }

        // 6. RESTORE (Remove transforms)
        ctx.restore();

        // 7. DRAW PLAYER (Fixed Center)
        // Since we rotated the world, the player is always facing UP relative to the canvas
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx + 5, cy + 6);
        ctx.lineTo(cx, cy + 4);
        ctx.lineTo(cx - 5, cy + 6);
        ctx.fill();

        // 8. BORDER
        ctx.strokeStyle = '#b45309'; // Bronze
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, this.RADIUS - 2, 0, Math.PI * 2);
        ctx.stroke();
    }
}
