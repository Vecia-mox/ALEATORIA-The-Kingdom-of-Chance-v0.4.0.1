
import * as THREE from 'three';
import { MapSystem } from '../../engine/systems/MapSystem';
import { GameDirector } from '../../engine/core/GameDirector';

export class MinimapController {
    private static ctx: CanvasRenderingContext2D | null = null;
    private static readonly DRAW_SCALE = 4; // Pixels per World Meter
    private static readonly RADAR_RADIUS = 75; // 150px / 2

    public static init(grid: number[][], size: number) {
        let container = document.getElementById('minimap-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'minimap-container';
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

        // 1. Clear & Background
        ctx.clearRect(0, 0, w, h);
        
        // 2. Setup Circular Mask (The Radar Scope)
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, this.RADAR_RADIUS, 0, Math.PI * 2);
        ctx.clip();

        // Background Fill
        ctx.fillStyle = '#050505';
        ctx.fill();

        // 3. Draw Terrain (North-Up)
        // We iterate visible grid area relative to player to save performance
        const viewDistMeters = 20; // 20m radius visible on map
        // Convert to tiles
        const offset = (50 * 4) / 2; // MapSize * TileSize / 2
        const pGridX = Math.floor((playerPos.x + offset) / 4);
        const pGridY = Math.floor((playerPos.z + offset) / 4);
        
        const range = 8; // Check 8 tiles around

        for (let y = -range; y <= range; y++) {
            for (let x = -range; x <= range; x++) {
                const gx = pGridX + x;
                const gy = pGridY + y;

                // Bounds Check
                if (gx < 0 || gx >= 50 || gy < 0 || gy >= 50) continue;

                // FOG OF WAR CHECK
                if (!MapSystem.isExplored(gx, gy)) continue;

                const tile = grid[gy][gx];
                if (tile === 0) continue; // Void

                // Calculate Canvas Position relative to Center
                const worldPos = MapSystem.gridToWorld(gx, gy);
                const relX = (worldPos.x - playerPos.x) * this.DRAW_SCALE;
                const relZ = (worldPos.z - playerPos.z) * this.DRAW_SCALE; // Z is Y in 2D

                const drawX = cx + relX;
                const drawY = cy + relZ;
                const size = 4 * this.DRAW_SCALE; // 4m tile * scale

                if (tile === 2) {
                    ctx.fillStyle = '#555555'; // Wall
                } else {
                    ctx.fillStyle = '#222222'; // Floor
                }
                
                // Draw Rect (with slight overlap to prevent seams)
                ctx.fillRect(drawX - 0.5, drawY - 0.5, size + 1, size + 1);
            }
        }

        // 4. Draw Portal (Objective)
        if (GameDirector.portal && GameDirector.portal.mesh.visible) {
            const p = GameDirector.portal.mesh.position;
            const rx = (p.x - playerPos.x) * this.DRAW_SCALE;
            const ry = (p.z - playerPos.z) * this.DRAW_SCALE;
            
            // Only draw if within bounds
            if (rx*rx + ry*ry < this.RADAR_RADIUS*this.RADAR_RADIUS) {
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.moveTo(cx + rx, cy + ry - 4);
                ctx.lineTo(cx + rx + 4, cy + ry);
                ctx.lineTo(cx + rx, cy + ry + 4);
                ctx.lineTo(cx + rx - 4, cy + ry);
                ctx.fill();
            }
        }

        // 5. Draw Enemies (Red Blips)
        ctx.fillStyle = '#ef4444';
        enemies.forEach(e => {
            if (e.userData.isDead) return;
            const rx = (e.position.x - playerPos.x) * this.DRAW_SCALE;
            const ry = (e.position.z - playerPos.z) * this.DRAW_SCALE;
            
            if (rx*rx + ry*ry < this.RADAR_RADIUS*this.RADAR_RADIUS) {
                ctx.beginPath();
                ctx.arc(cx + rx, cy + ry, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 6. Draw Loot (Gold Blips)
        ctx.fillStyle = '#fbbf24';
        lootItems.forEach(i => {
            if (i.isCollected) return;
            const rx = (i.mesh.position.x - playerPos.x) * this.DRAW_SCALE;
            const ry = (i.mesh.position.z - playerPos.z) * this.DRAW_SCALE;
            
            if (rx*rx + ry*ry < this.RADAR_RADIUS*this.RADAR_RADIUS) {
                ctx.beginPath();
                ctx.arc(cx + rx, cy + ry, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Restore mask
        ctx.restore();

        // 7. Draw Player Arrow (Center, Rotated)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-playerRotY); // Inverse rotation to point direction
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(5, 6);
        ctx.lineTo(0, 4);
        ctx.lineTo(-5, 6);
        ctx.fill();
        
        ctx.restore();

        // 8. Draw Border Ring (Overlay)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, this.RADAR_RADIUS - 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // 9. Scanline Effect (Optional Juice)
        const time = Date.now() / 2000;
        const scanY = (time % 1) * h;
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY);
        ctx.stroke();
    }
}
