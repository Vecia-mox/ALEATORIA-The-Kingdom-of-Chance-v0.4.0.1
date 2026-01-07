
/**
 * TITAN ENGINE: ULTIMATE SYSTEM
 * Manages the "Super Mode" transformation state.
 */

import { Scene } from 'phaser';
import { HapticsManager } from '../input/HapticsManager';

export class UltimateSystem {
  private static instance: UltimateSystem;
  
  // State
  private charge: number = 0;
  private maxCharge: number = 100;
  private isActive: boolean = false;
  private duration: number = 15000; // 15s
  private timer: number = 0;

  // Scene Ref for Visuals
  private scene: Scene | null = null;
  private playerSprite: any = null;

  private constructor() {}

  public static getInstance(): UltimateSystem {
    if (!UltimateSystem.instance) UltimateSystem.instance = new UltimateSystem();
    return UltimateSystem.instance;
  }

  public bind(scene: Scene, playerSprite: any) {
    this.scene = scene;
    this.playerSprite = playerSprite;
  }

  public addCharge(amount: number) {
    if (this.isActive) return;
    this.charge = Math.min(this.maxCharge, this.charge + amount);
    
    if (this.charge === this.maxCharge) {
        // Trigger "Ready" FX
        HapticsManager.trigger('MEDIUM');
        // TODO: Emit UI Event 'ULTIMATE_READY'
    }
  }

  public getChargePercent(): number {
    if (this.isActive) {
        return (this.timer / this.duration) * 100; // Depleting bar
    }
    return (this.charge / this.maxCharge) * 100;
  }

  public trigger() {
    if (this.charge < this.maxCharge || this.isActive || !this.playerSprite) return;

    this.isActive = true;
    this.timer = this.duration;
    this.charge = 0;

    // 1. Visual Transformation
    // Burst particles
    if (this.scene) {
        const p = this.playerSprite;
        // this.scene.add.particles(...) // Explosion
    }

    // Scale Up
    this.scene?.tweens.add({
        targets: this.playerSprite,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        ease: 'Back.out'
    });

    // Color Tint (Gold/Electric)
    this.playerSprite.setTint(0xffaa00);

    // Haptics
    HapticsManager.trigger('HEAVY');

    console.log("[Ultimate] TRANSFORMATION ACTIVE!");
  }

  public update(dt: number) {
    if (!this.isActive) return;

    this.timer -= dt;

    if (this.timer <= 0) {
        this.endUltimate();
    } else {
        // Continuous FX (Shake/Glow)
        if (Math.random() > 0.8 && this.scene) {
            // Spawn lightning arc?
        }
    }
  }

  private endUltimate() {
    this.isActive = false;
    
    // Revert Scale
    if (this.playerSprite) {
        this.scene?.tweens.add({
            targets: this.playerSprite,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 500,
            ease: 'Quad.out'
        });
        this.playerSprite.clearTint();
    }

    HapticsManager.trigger('MEDIUM');
    console.log("[Ultimate] Transformation ended.");
  }

  public isUltimateActive(): boolean {
      return this.isActive;
  }
}
