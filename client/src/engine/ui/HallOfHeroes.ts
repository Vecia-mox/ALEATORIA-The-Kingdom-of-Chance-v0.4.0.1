
/**
 * TITAN ENGINE: HALL OF HEROES
 * Displays the Top 3 Players of the previous cycle as giant stone statues.
 */

import Phaser, { Scene } from 'phaser';
import { Player, Equipment } from '../../types';
import { PaperDoll } from './PaperDoll'; // Reuse logic if possible, or simplified mesh

export interface HeroEntry {
  rank: number;
  playerName: string;
  equipment: Equipment;
  reignDuration: string; // "3 Weeks"
}

export class HallOfHeroes {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;
  private heroes: HeroEntry[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(5); // Below UI, above ground
  }

  /**
   * Called on entering the Hub city.
   */
  public setup(heroes: HeroEntry[], centerX: number, centerY: number) {
    this.heroes = heroes;
    this.container.setPosition(centerX, centerY);
    this.container.removeAll(true);

    // Positions for Rank 2, Rank 1, Rank 3
    const positions = [
      { x: -100, y: 20, scale: 1.2 }, // Rank 2
      { x: 0, y: -20, scale: 1.5 },   // Rank 1
      { x: 100, y: 20, scale: 1.2 }   // Rank 3
    ];

    heroes.forEach((hero, idx) => {
      if (idx >= 3) return;
      const pos = positions[idx];
      this.createStatue(hero, pos.x, pos.y, pos.scale);
    });
  }

  private createStatue(hero: HeroEntry, x: number, y: number, scale: number) {
    // 1. Base Pedestal
    const pedestal = this.scene.add.sprite(x, y + 40, 'prop_pedestal_stone');
    pedestal.setScale(scale);
    this.container.add(pedestal);

    // 2. The Hero Mesh (Simulated as Sprite for 2.5D, or 3D Mesh in full engine)
    // We assume we have a "Snapshot" texture of the player generated at season end.
    // If not, we construct it dynamically.
    const statueSprite = this.scene.add.sprite(x, y, `snapshot_${hero.playerName}`); 
    
    // Fallback if snapshot missing
    if (!this.scene.textures.exists(`snapshot_${hero.playerName}`)) {
       // Use generic class statue
       statueSprite.setTexture('statue_generic'); 
    }

    statueSprite.setScale(scale);
    statueSprite.setTint(0x888888); // Stone Grey
    statueSprite.setPipeline('Light2D'); // Reacts to lighting
    
    // Shader: Stone Texture Overlay?
    // statueSprite.setPostPipeline('StoneEffect');

    this.container.add(statueSprite);

    // 3. Nameplate (Interactive)
    const plate = this.scene.add.text(x, y + 60 * scale, hero.playerName, {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.container.add(plate);

    // Interaction
    statueSprite.setInteractive();
    statueSprite.on('pointerdown', () => {
      this.showDetails(hero);
    });
  }

  private showDetails(hero: HeroEntry) {
    // Open UI Window with full loadout
    console.log(`[Hall] Viewing hero: ${hero.playerName}`);
    // WindowManager.open('INSPECT', { player: hero });
  }
}
