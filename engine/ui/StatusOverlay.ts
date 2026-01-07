
import { DamageNumbers } from './DamageNumbers';
import { WorldState } from '../../types';
import * as THREE from 'three';

/**
 * TITAN ENGINE: STATUS OVERLAY
 * One-way binding from Engine State -> DOM Elements.
 */
export class StatusOverlay {
  private lastHp: number = -1;
  private lastMp: number = -1;
  private camera: THREE.Camera | null = null;

  // Cache DOM elements to avoid querySelector every frame
  private hpBar: HTMLElement | null = null;
  private mpBar: HTMLElement | null = null;

  constructor() {
    // DamageNumbers is static in this version
  }

  public setCamera(camera: THREE.Camera) {
    this.camera = camera;
  }

  public update(state: WorldState) {
    const player = state.players['player-1'];
    if (!player) return;

    // 1. Spawn Damage Numbers on HP Change
    if (this.lastHp !== -1 && player.hp < this.lastHp && this.camera) {
      const dmg = this.lastHp - player.hp;
      // Convert 2D pos to 3D world pos approx for text spawn
      // Or use known player 3D transform
      // Here assuming we have access to player pos from state
      const x = player.pos.x / 16.0; // Scale 2D -> 3D
      const z = player.pos.y / 16.0;
      
      DamageNumbers.spawn(new THREE.Vector3(x, 0, z), dmg, this.camera);
    }
    
    // Update Tracking
    this.lastHp = player.hp;
    this.lastMp = player.mp;

    // 2. Direct DOM Manipulation (Optional Performance Boost over React State)
    /*
    if (!this.hpBar) this.hpBar = document.getElementById('hud-hp-bar');
    if (this.hpBar) {
      const pct = Math.max(0, player.hp / player.maxHp) * 100;
      this.hpBar.style.width = `${pct}%`;
    }
    */
  }
}
