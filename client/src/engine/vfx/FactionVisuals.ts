
/**
 * TITAN ENGINE: FACTION VISUALS
 * Handles visual overrides for Immortals (Gold/Light) and Shadows (Purple/Darkness).
 */

import { Scene } from 'phaser';
import { Renderer3D } from '../graphics/Renderer3D';

export type Faction = 'IMMORTAL' | 'SHADOW' | 'ADVENTURER';

export class FactionVisuals {
  private scene: Scene;
  private renderer: Renderer3D;
  
  // Cache for attached visual containers
  private attachments: Map<string, any[]> = new Map();

  constructor(scene: Scene, renderer: Renderer3D) {
    this.scene = scene;
    this.renderer = renderer;
  }

  /**
   * Applies faction-specific visuals to an entity.
   */
  public applyFactionVisuals(entityId: string, entityPos: {x: number, y: number}, faction: Faction, isLeader: boolean) {
    this.clearVisuals(entityId);

    if (faction === 'IMMORTAL') {
      this.applyImmortalVisuals(entityId, entityPos, isLeader);
    } else if (faction === 'SHADOW') {
      this.applyShadowVisuals(entityId, entityPos);
    }
  }

  public clearVisuals(entityId: string) {
    if (this.attachments.has(entityId)) {
      const visuals = this.attachments.get(entityId)!;
      visuals.forEach(v => {
        if (v.destroy) v.destroy();
        // If 3D mesh, remove from renderer
        // this.renderer.removeMesh(v.id);
      });
      this.attachments.delete(entityId);
    }
  }

  private applyImmortalVisuals(entityId: string, pos: {x: number, y: number}, isLeader: boolean) {
    const visuals: any[] = [];

    // 1. Golden Crown (3D Attachment)
    // We simulate 3D attachment by tracking position in update loop
    // In a full 3D engine, this would use bone attachment
    // this.renderer.attachMesh(entityId, 'mesh_crown_gold', 'Head');

    // 2. Shader Override (Gold Rim Light)
    // const material = this.renderer.getMaterial(entityId);
    // material.setFloat('uRimPower', 4.0);
    // material.setColor('uRimColor', [1.0, 0.8, 0.1]); // Gold

    // 3. Leader Wings (2D/3D Hybrid)
    if (isLeader) {
      const wings = this.scene.add.sprite(pos.x, pos.y, 'vfx_wings_gold');
      wings.setDepth(100); // Behind char? Or 3000 for on top
      wings.play('anim_wings_flap');
      wings.setData('parentId', entityId);
      visuals.push(wings);
      
      // Add light source
      const light = this.scene.lights.addLight(pos.x, pos.y, 300, 0xffaa00, 1.5);
      visuals.push(light);
    }

    this.attachments.set(entityId, visuals);
  }

  private applyShadowVisuals(entityId: string, pos: {x: number, y: number}) {
    const visuals: any[] = [];

    // 1. Purple Mist (Particle Emitter at feet)
    const mist = this.scene.add.particles(pos.x, pos.y, 'vfx_smoke_purple', {
      speed: 20,
      scale: { start: 0.5, end: 1.5 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1000,
      quantity: 2,
      blendMode: 'ADD'
    });
    mist.setDepth(5); // Ground level
    visuals.push(mist);

    // 2. Whispers (Audio/Visual distortion)
    // Only visible to other Shadows usually, but here applied to entity
    // this.renderer.setPostProcess(entityId, 'distortion_waves');

    this.attachments.set(entityId, visuals);
  }

  /**
   * Call in main update loop to sync attached visuals to entity position.
   */
  public update(entityId: string, x: number, y: number) {
    const visuals = this.attachments.get(entityId);
    if (!visuals) return;

    visuals.forEach(v => {
      // Sync Sprites/Particles
      if (v.setPosition) v.setPosition(x, y);
      
      // Special offset for Wings
      if (v.texture && v.texture.key === 'vfx_wings_gold') {
        v.setPosition(x, y - 20); // Height offset
      }
    });
  }
}
