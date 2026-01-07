
/**
 * TITAN ENGINE: SKILL AIMING SYSTEM
 * Manages ground-projected "Splat" indicators for targeting skills.
 * Supports Linear (Beam), Radial (AoE), and Cone (Shotgun) shapes.
 */

import Phaser, { Scene, GameObjects } from 'phaser';

export type AimShape = 'LINEAR' | 'RADIAL' | 'CONE';

export class SkillAiming {
  private scene: Scene;
  
  // Indicators
  private linearIndicator: GameObjects.TileSprite;
  private radialIndicator: GameObjects.Image;
  private coneIndicator: GameObjects.Image;
  
  private activeShape: AimShape | null = null;
  private isVisible: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createIndicators();
  }

  private createIndicators() {
    // 1. Generate Textures if missing (Procedural fallback)
    if (!this.scene.textures.exists('aim-linear')) {
        const g = this.scene.make.graphics({x:0, y:0, add:false});
        
        // Linear: Fading arrow
        g.fillGradientStyle(0x00ffff, 0x00ffff, 0x0000ff, 0x0000ff, 0.5, 0.5, 0, 0);
        g.fillRect(0, 0, 64, 256);
        g.generateTexture('aim-linear', 64, 256);
        g.clear();

        // Radial: Ring
        g.lineStyle(4, 0xff0000, 0.8);
        g.strokeCircle(64, 64, 60);
        g.fillStyle(0xff0000, 0.2);
        g.fillCircle(64, 64, 60);
        g.generateTexture('aim-radial', 128, 128);
        g.clear();

        // Cone: Pie slice
        g.fillStyle(0xffaa00, 0.3);
        g.slice(128, 128, 120, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45), false);
        g.fillPath();
        g.lineStyle(2, 0xffaa00, 0.8);
        g.slice(128, 128, 120, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45), false);
        g.strokePath();
        g.generateTexture('aim-cone', 256, 256);
    }

    // 2. Instantiate Objects (Hidden by default)
    // Depth 5 puts it just above the ground/shadows but below entities
    this.linearIndicator = this.scene.add.tileSprite(0, 0, 64, 256, 'aim-linear')
        .setOrigin(0.5, 1) // Pivot at bottom (player feet)
        .setDepth(5)
        .setVisible(false)
        .setBlendMode(Phaser.BlendModes.ADD);

    this.radialIndicator = this.scene.add.image(0, 0, 'aim-radial')
        .setDepth(5)
        .setVisible(false)
        .setBlendMode(Phaser.BlendModes.ADD);

    this.coneIndicator = this.scene.add.image(0, 0, 'aim-cone')
        .setOrigin(0, 0.5) // Pivot at left-center (player)
        .setDepth(5)
        .setVisible(false)
        .setBlendMode(Phaser.BlendModes.ADD);
  }

  public show(shape: AimShape, origin: {x: number, y: number}, direction: {x: number, y: number}, range: number) {
    this.hide(); // Hide others
    this.isVisible = true;
    this.activeShape = shape;

    const angle = Math.atan2(direction.y, direction.x);
    const deg = Phaser.Math.RadToDeg(angle);

    switch (shape) {
        case 'LINEAR':
            this.linearIndicator.setVisible(true);
            this.linearIndicator.setPosition(origin.x, origin.y);
            this.linearIndicator.setRotation(angle + Math.PI/2); // Sprite points up, we need to rotate
            this.linearIndicator.height = range;
            // Scroll texture for flow effect
            this.linearIndicator.tilePositionY -= 2; 
            break;

        case 'RADIAL':
            this.radialIndicator.setVisible(true);
            // Place at max range in direction
            const targetX = origin.x + direction.x * range;
            const targetY = origin.y + direction.y * range;
            this.radialIndicator.setPosition(targetX, targetY);
            // Pulse scale
            const scale = 1.0 + Math.sin(this.scene.time.now * 0.01) * 0.05;
            this.radialIndicator.setScale(scale);
            break;

        case 'CONE':
            this.coneIndicator.setVisible(true);
            this.coneIndicator.setPosition(origin.x, origin.y);
            this.coneIndicator.setRotation(angle);
            // Scale width based on range (approx)
            const coneScale = range / 128; 
            this.coneIndicator.setScale(coneScale);
            break;
    }
  }

  public hide() {
    this.isVisible = false;
    this.linearIndicator.setVisible(false);
    this.radialIndicator.setVisible(false);
    this.coneIndicator.setVisible(false);
    this.activeShape = null;
  }

  public update() {
    if (this.isVisible && this.activeShape === 'LINEAR') {
        this.linearIndicator.tilePositionY -= 4; // Flow speed
    }
  }
}
