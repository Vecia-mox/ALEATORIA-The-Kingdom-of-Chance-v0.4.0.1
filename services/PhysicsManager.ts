
import { Position } from '../types';

/**
 * PhysicsManager provides static utilities for game-world physical interactions.
 * Optimized for performance in a web environment.
 */
export class PhysicsManager {
  /**
   * Applies a physical impulse away from a source position with friction handling.
   */
  static applyKnockback(target: any, source: Position, force: number) {
    if (!target || !target.body) return;

    const angle = Math.atan2(
      target.y - source.y,
      target.x - source.x
    );

    target.body.setDrag(1500);
    target.body.velocity.x = Math.cos(angle) * force;
    target.body.velocity.y = Math.sin(angle) * force;
    
    // Slight size pulse on impact
    target.setScale(1.1);
    target.scene.time.delayedCall(100, () => {
        if (target.active) target.setScale(1);
    });
  }

  /**
   * Applies a high velocity dash in a specific direction with a visual trail.
   */
  static applyDash(sprite: any, dir: {x: number, y: number}, speed: number) {
    if (!sprite.body) return;
    
    // Apply Velocity
    sprite.body.setDrag(500); // Lower drag during dash
    sprite.body.setVelocity(dir.x * speed, dir.y * speed);

    // Visual: Ghost Trail
    const scene = sprite.scene;
    for(let i=0; i<3; i++) {
        scene.time.delayedCall(i * 60, () => {
             if (!sprite.active) return;
             const ghost = scene.add.circle(sprite.x, sprite.y, 14, 0x38bdf8, 0.4);
             scene.tweens.add({
                 targets: ghost,
                 alpha: 0,
                 scale: 0.5,
                 duration: 250,
                 onComplete: () => ghost.destroy()
             });
        });
    }
  }

  /**
   * Utility to create an Arrow projectile with trails.
   */
  static createArrow(scene: any, x: number, y: number, angle: number, speed: number) {
    const arrow = scene.physics.add.sprite(x, y, 'projectile-arrow');
    arrow.setRotation(angle);
    arrow.setDepth(2100);
    scene.physics.velocityFromRotation(angle, speed, arrow.body.velocity);
    
    // Trail Effect
    const particles = scene.add.particles(0, 0, 'weather-ash', {
        speed: 20,
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 400,
        follow: arrow
    });
    
    scene.time.delayedCall(1800, () => {
      if (arrow.active) {
          particles.destroy();
          arrow.destroy();
      }
    });
    
    return arrow;
  }

  /**
   * Utility to create a pushable crate.
   */
  static createCrate(scene: any, x: number, y: number) {
    const crate = scene.physics.add.sprite(x, y, 'interactable-crate');
    crate.setImmovable(false);
    crate.body.setDrag(2000);
    crate.body.setBounce(0.2);
    crate.body.setCollideWorldBounds(true);
    crate.setPipeline('Light2D');
    crate.setDepth(1000);
    return crate;
  }
}
