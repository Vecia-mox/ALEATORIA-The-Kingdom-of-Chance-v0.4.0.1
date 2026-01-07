
import { Scene } from 'phaser';
import { DamageFloater } from './DamageFloater';

export class CombatManager {
  private scene: Scene;
  private floater: DamageFloater;

  constructor(scene: Scene) {
    this.scene = scene;
    this.floater = new DamageFloater(scene);
  }

  public onHit(target: any, damage: number, isCrit: boolean, isPlayerDamage: boolean = false) {
    // 1. Show Number
    this.floater.showDamage(target.x, target.y - 20, damage, isCrit, isPlayerDamage);

    // 2. Flash Effect & Brief Hit Animation (Squash/Recoil)
    if (target.setTintFill) {
        // Flash White
        target.setTintFill(0xffffff);
        this.scene.time.delayedCall(80, () => {
          if (target.active) target.clearTint();
        });

        // Brief Hit Animation: Impact Squash & Shake
        if (target.scaleX !== undefined) {
            const originalScale = target.scaleX; // Assuming uniform scaling logic handled by sprites
            this.scene.tweens.add({
                targets: target,
                scaleX: originalScale * 1.3, // Squash out
                scaleY: originalScale * 0.7, // Squash down
                duration: 50,
                yoyo: true,
                ease: 'Quad.easeInOut',
                onComplete: () => {
                    if (target.active) {
                        target.scaleX = originalScale;
                        target.scaleY = originalScale;
                    }
                }
            });
            
            // Random Recoil Shake
            this.scene.tweens.add({
                targets: target,
                x: target.x + (Math.random() * 10 - 5),
                y: target.y + (Math.random() * 10 - 5),
                duration: 50,
                yoyo: true
            });
        }
    }

    // 3. Screen Shake & Hit Stop (Juice)
    // Only shake/stop on significant hits (Crits or Player taking damage)
    if (isCrit || isPlayerDamage) {
      const intensity = isCrit ? 0.015 : 0.01;
      this.scene.cameras.main.shake(150, intensity); 
      
      // Freeze Frame
      this.triggerHitStop(50);
    } else {
      // Micro shake for normal hits
      this.scene.cameras.main.shake(80, 0.003);
    }
  }

  public triggerHitStop(durationMs: number) {
    if (this.scene.physics.world.isPaused) return;
    
    this.scene.physics.world.pause();
    // Using setTimeout to resume independent of Phaser's clock
    setTimeout(() => {
        if (this.scene && this.scene.physics && this.scene.physics.world) {
            this.scene.physics.world.resume();
        }
    }, durationMs);
  }
}
