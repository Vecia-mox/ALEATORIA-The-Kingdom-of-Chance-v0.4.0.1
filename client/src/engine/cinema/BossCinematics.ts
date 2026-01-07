
/**
 * TITAN ENGINE: BOSS CINEMATICS
 * Handles dynamic camera interrupts and Quick Time Events (QTEs) during boss fights.
 */

import { Scene, Cameras } from 'phaser';
import { MobileBridge } from '../../bridge/MobileBridge'; // To lock input

export class BossCinematics {
  private scene: Scene;
  private mainCamera: Cameras.Scene2D.Camera;
  private isCinematicActive: boolean = false;
  
  // Store previous state to restore
  private originalZoom: number = 1;
  private originalScroll: {x: number, y: number} = {x:0, y:0};

  constructor(scene: Scene) {
    this.scene = scene;
    this.mainCamera = scene.cameras.main;
  }

  /**
   * Zooms in on a target action, disabling player control.
   */
  public playGrabSequence(bossX: number, bossY: number, playerX: number, playerY: number) {
    if (this.isCinematicActive) return;
    this.isCinematicActive = true;

    // 1. Lock Input
    this.lockInput(true);

    // 2. Save Camera State
    this.originalZoom = this.mainCamera.zoom;
    
    // 3. Calculate Midpoint
    const midX = (bossX + playerX) / 2;
    const midY = (bossY + playerY) / 2;

    // 4. Tween Camera
    this.mainCamera.stopFollow();
    this.scene.tweens.add({
      targets: this.mainCamera,
      zoom: 2.0,
      scrollX: midX - (this.mainCamera.width / 2) / 2.0, // Adjust for zoom center
      scrollY: midY - (this.mainCamera.height / 2) / 2.0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        // Shake on impact
        this.scene.cameras.main.shake(500, 0.02);
      }
    });

    // 5. Release after duration (Simulated animation length)
    this.scene.time.delayedCall(2000, () => this.restoreCamera());
  }

  /**
   * Phase Transition: Screen shake and slow pan to boss roar.
   */
  public playPhaseTransition(bossX: number, bossY: number) {
    this.isCinematicActive = true;
    this.lockInput(true);
    this.mainCamera.stopFollow();

    // Pan to Boss
    this.scene.tweens.add({
      targets: this.mainCamera,
      scrollX: bossX - this.mainCamera.width / 2,
      scrollY: bossY - this.mainCamera.height / 2,
      zoom: 1.5,
      duration: 1000,
      ease: 'Cubic.easeInOut'
    });

    // Flash White
    this.scene.cameras.main.flash(1000, 255, 255, 255);

    // Restore after roar
    this.scene.time.delayedCall(3000, () => this.restoreCamera());
  }

  private restoreCamera() {
    // Return to player logic handled by GameCanvas update loop re-enabling follow
    // We just reset flags here.
    
    this.scene.tweens.add({
      targets: this.mainCamera,
      zoom: this.originalZoom,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.isCinematicActive = false;
        this.lockInput(false);
        // Re-attach follow in main loop logic
      }
    });
  }

  private lockInput(locked: boolean) {
    // Hacky: We modify the bridge directly or set a flag in InputManager
    // Ideally InputManager has a setLocked() method.
    // For now, we assume MobileBridge has a flag or we clear it.
    if (locked) {
        MobileBridge.moveDir = { x: 0, y: 0 };
        MobileBridge.isAttacking = false;
        // In a real implementation, we'd set a 'globalInputLock' flag in InputManager
    }
  }

  public isActive() {
      return this.isCinematicActive;
  }
}
