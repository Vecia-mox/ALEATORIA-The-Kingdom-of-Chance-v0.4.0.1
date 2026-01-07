/**
 * TITAN ENGINE: TELEGRAPH SYSTEM
 * Renders projected "Danger Zones" (Red Carpets) on the ground.
 * Shapes: CIRCLE, RECT, CONE, DONUT.
 */

import Phaser, { Scene, GameObjects } from 'phaser';

export type TelegraphShape = 'CIRCLE' | 'RECT' | 'CONE' | 'DONUT';

interface TelegraphInstance {
  id: string;
  shape: TelegraphShape;
  graphic: GameObjects.Graphics; // Or Mesh/Shader
  x: number;
  y: number;
  params: any; // Radius, Width, Length, Angle
  startTime: number;
  duration: number;
}

export class TelegraphSystem {
  private scene: Scene;
  private activeTelegraphs: Map<string, TelegraphInstance> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public spawn(id: string, shape: TelegraphShape, x: number, y: number, duration: number, params: any) {
    // Clean up if ID exists (overwrite)
    this.remove(id);

    const graphic = this.scene.add.graphics();
    graphic.setDepth(1); // On ground, below entities (usually)
    graphic.setBlendMode(Phaser.BlendModes.ADD);

    this.activeTelegraphs.set(id, {
      id,
      shape,
      graphic,
      x,
      y,
      params,
      startTime: this.scene.time.now,
      duration
    });
  }

  public remove(id: string) {
    const t = this.activeTelegraphs.get(id);
    if (t) {
      t.graphic.destroy();
      this.activeTelegraphs.delete(id);
    }
  }

  public update() {
    const now = this.scene.time.now;

    this.activeTelegraphs.forEach((t) => {
      const progress = Math.min(1, (now - t.startTime) / t.duration);
      
      // If complete, visual cleanup is handled by owner calling remove(), 
      // but we can pulse at 100% to indicate impact frame.
      if (progress >= 1) {
        t.graphic.alpha = 1;
        // Optionally flash white
        return;
      }

      this.drawShape(t, progress);
    });
  }

  private drawShape(t: TelegraphInstance, progress: number) {
    const g = t.graphic;
    g.clear();

    // Base Color: Dark Red
    // Fill Color: Bright Orange/Red
    const baseColor = 0x550000;
    const fillColor = 0xff4400;
    const alpha = 0.4;

    g.setPosition(t.x, t.y);

    switch (t.shape) {
      case 'CIRCLE':
        const radius = t.params.radius || 100;
        // Draw Base
        g.fillStyle(baseColor, alpha);
        g.fillCircle(0, 0, radius);
        // Draw Fill (Expanding from center)
        g.fillStyle(fillColor, alpha + 0.2);
        g.fillCircle(0, 0, radius * progress);
        // Border
        g.lineStyle(2, fillColor, 0.8);
        g.strokeCircle(0, 0, radius);
        break;

      case 'RECT':
        const w = t.params.width || 100;
        const h = t.params.length || 300;
        const rot = t.params.rotation || 0; // Rads
        
        g.rotation = rot;
        
        // Base
        g.fillStyle(baseColor, alpha);
        g.fillRect(-w/2, 0, w, h); // Anchor bottom-center usually
        // Fill (Bottom to Top)
        g.fillStyle(fillColor, alpha + 0.2);
        g.fillRect(-w/2, 0, w, h * progress);
        
        g.lineStyle(2, fillColor, 0.8);
        g.strokeRect(-w/2, 0, w, h);
        break;

      case 'CONE':
        const angle = t.params.angle || 90; // Degrees
        const range = t.params.radius || 300;
        const direction = t.params.rotation || 0;
        const startAngle = Phaser.Math.DegToRad(direction - angle/2);
        const endAngle = Phaser.Math.DegToRad(direction + angle/2);

        // Base
        g.fillStyle(baseColor, alpha);
        g.slice(0, 0, range, startAngle, endAngle, false);
        g.fillPath();
        
        // Fill (Expanding Radius)
        g.fillStyle(fillColor, alpha + 0.2);
        g.slice(0, 0, range * progress, startAngle, endAngle, false);
        g.fillPath();
        break;
        
      case 'DONUT':
        const inner = t.params.innerRadius || 50;
        const outer = t.params.outerRadius || 150;
        
        // Complex shape requires path subtraction or render texture masking
        // Simplified: Draw outer, overlay inner with black? No, alpha blend fails.
        // Phaser Graphics supports holes in paths in WebGL
        
        g.fillStyle(baseColor, alpha);
        g.beginPath();
        g.arc(0, 0, outer, 0, Math.PI * 2);
        g.arc(0, 0, inner, 0, Math.PI * 2, true); // Counter-clockwise for hole
        g.fillPath();
        
        // Fill logic: Expand inner ring outward?
        // Let's do simple opacity pulse for donut instead of geometric fill
        const fillAlpha = alpha + (progress * 0.4);
        g.fillStyle(fillColor, fillAlpha);
        g.beginPath();
        g.arc(0, 0, outer, 0, Math.PI * 2);
        g.arc(0, 0, inner, 0, Math.PI * 2, true);
        g.fillPath();
        break;
    }
  }
}