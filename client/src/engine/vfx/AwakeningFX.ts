
/**
 * TITAN ENGINE: AWAKENING FX
 * Handles visual flair for fully upgraded gear (Glowing Mesh, Wings).
 */

import { Scene, GameObjects } from 'phaser';

export class AwakeningFX {
  private scene: Scene;
  private attachedEffects: Map<string, GameObjects.Container> = new Map(); // EntityID -> Container of FX

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Scans a player's equipment and applies awakening effects.
   */
  public updateEffects(entity: any, equipment: any[]) {
    const entityId = entity.getData('mobId') || 'player';
    
    // Clear old effects
    if (this.attachedEffects.has(entityId)) {
      this.attachedEffects.get(entityId)?.destroy();
      this.attachedEffects.delete(entityId);
    }

    const fxContainer = this.scene.add.container(entity.x, entity.y);
    fxContainer.setDepth(entity.depth + 1);
    
    let awakenedCount = 0;

    equipment.forEach(item => {
      if (!item) return;
      
      const isAwakened = (item.rank >= 10); // Logic: Rank 10+ is awakened
      if (isAwakened) {
        awakenedCount++;
        this.attachSlotFX(fxContainer, item.slot);
      }
    });

    // Tier 1 Wings: All 6 main slots awakened
    if (awakenedCount >= 6) {
      this.attachWings(fxContainer, 'tier_1');
    }

    this.attachedEffects.set(entityId, fxContainer);
    
    // Attach update loop to sync position
    entity.on('destroy', () => fxContainer.destroy());
    // In update loop elsewhere: fxContainer.setPosition(entity.x, entity.y);
  }

  public update(entity: any) {
    const entityId = entity.getData('mobId') || 'player';
    const container = this.attachedEffects.get(entityId);
    if (container && entity.active) {
        container.setPosition(entity.x, entity.y);
    }
  }

  private attachSlotFX(container: GameObjects.Container, slot: string) {
    // 1. Determine Position offset based on slot (Shoulder, Head, Weapon)
    let offset = { x: 0, y: 0 };
    let color = 0x8822ff; // Purple default

    switch(slot) {
        case 'HEAD': offset = {x: 0, y: -20}; break;
        case 'MAIN_HAND': offset = {x: 15, y: 5}; color = 0xffaa00; break;
        case 'OFF_HAND': offset = {x: -15, y: 5}; break;
        case 'CHEST': offset = {x: 0, y: 0}; break;
    }

    // 2. Create Glow Particle Emitter (Simulated with simple image for container)
    // In real implementation, this attaches a ParticleEmitter to the container
    const glow = this.scene.add.star(offset.x, offset.y, 4, 4, 8, color);
    
    this.scene.tweens.add({
        targets: glow,
        alpha: 0.5,
        scale: 1.5,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1
    });

    container.add(glow);
  }

  private attachWings(container: GameObjects.Container, tier: string) {
    // "Tyrael Wings" Effect
    // Using simple graphics lines for MVP
    const wingColor = tier === 'tier_1' ? 0xffffaa : 0xff0000;
    
    const leftWing = this.scene.add.graphics();
    leftWing.lineStyle(2, wingColor, 0.8);
    leftWing.beginPath();
    // Arc shape
    leftWing.moveTo(0, -10);
    leftWing.quadraticBezierTo(-30, -40, -50, -10);
    leftWing.quadraticBezierTo(-40, 10, -10, 0);
    leftWing.strokePath();
    
    const rightWing = this.scene.add.graphics();
    rightWing.lineStyle(2, wingColor, 0.8);
    rightWing.beginPath();
    rightWing.moveTo(0, -10);
    rightWing.quadraticBezierTo(30, -40, 50, -10);
    rightWing.quadraticBezierTo(40, 10, 10, 0);
    rightWing.strokePath();

    container.add([leftWing, rightWing]);
    container.sendToBack(leftWing);
    container.sendToBack(rightWing);

    // Animation: Flap
    this.scene.tweens.add({
        targets: [leftWing, rightWing],
        scaleX: 0.8,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }
}
