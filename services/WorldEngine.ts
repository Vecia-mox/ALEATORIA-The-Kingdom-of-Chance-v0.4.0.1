
import Phaser from 'phaser';
import { Chunk } from '../types';
import { ObjectPool } from './ObjectPool';
import { WorldConfig } from '../data/WorldConfig';

export class WorldEngine {
  private scene: any;
  private chunkObjects: Map<string, { bobs: any[], props: any[] }> = new Map();
  private tilesetName: string = 'tile-atlas';
  public isReady: boolean = false;
  
  // Rendering Layers
  private groundBlitter: Phaser.GameObjects.Blitter | null = null;
  private playerLight: Phaser.GameObjects.Light | null = null;
  private ambientLight: { r: number, g: number, b: number } = { r: 100, g: 100, b: 120 };

  constructor(scene: any) {
    this.scene = scene;
    ObjectPool.getInstance(scene);
  }

  public get loadedChunkKeys(): string[] {
      return Array.from(this.chunkObjects.keys());
  }

  public init() {
    // Blitter is fastest for static tiles
    this.groundBlitter = this.scene.add.blitter(0, 0, this.tilesetName);
    this.groundBlitter.setDepth(0); // Ground Level

    // Enable Lighting System
    this.scene.lights.enable();
    this.scene.lights.setAmbientColor(0x666677); // Default Grey-Blue

    this.isReady = true;
  }

  public addCollider(playerSprite: any) {
    this.playerLight = this.scene.lights.addLight(playerSprite.x, playerSprite.y, 400, 0xffaa00, 1.5);
    
    // Colliders logic
    this.chunkObjects.forEach(obj => {
      obj.props.forEach((prop: any) => {
          if (prop.body) this.scene.physics.add.collider(playerSprite, prop);
      });
    });
  }

  public processChunk(key: string, chunk: Chunk, useLightPipeline: boolean = true) {
    if (!this.isReady || this.chunkObjects.has(key)) return;

    try {
      const worldX = chunk.x * WorldConfig.CHUNK_PIXELS;
      const worldY = chunk.y * WorldConfig.CHUNK_PIXELS;
      
      const bobs: any[] = [];
      const props: any[] = [];
      const tileW = WorldConfig.TILE_SIZE;

      // 1. Terrain Tiles (PBR)
      if (this.groundBlitter) {
          for (let y = 0; y < chunk.height; y++) {
              for (let x = 0; x < chunk.width; x++) {
                  const tileId = chunk.data[y][x];
                  // Blitter draws "flat" tiles fast
                  const bob = this.groundBlitter.create(worldX + x * tileW, worldY + y * tileW, tileId);
                  bobs.push(bob);
              }
          }
      }

      // 2. Props (3D Objects)
      chunk.props.forEach(propData => {
          const propKey = `prop-${propData.type}`;
          if (this.scene.textures.exists(propKey)) {
              // Shadow (Skewed)
              const shadow = this.scene.add.image(worldX + propData.x + 10, worldY + propData.y + 10, 'shadow-base');
              shadow.setDepth(0.5); // Between ground and objects
              shadow.setAlpha(0.6);
              props.push(shadow);

              // Object Sprite
              const sprite = this.scene.physics.add.sprite(worldX + propData.x, worldY + propData.y, propKey);
              sprite.setOrigin(0.5, 0.9); // Anchor at feet for Y-sort
              sprite.setData('isSortable', true);
              
              if (useLightPipeline) sprite.setPipeline('Light2D');

              if (propData.isSolid) {
                  sprite.body.setImmovable(true);
                  sprite.body.setSize(32, 20); // Small hitbox at feet
                  sprite.body.setOffset(16, sprite.height - 20);
              }
              props.push(sprite);
          }
      });

      this.chunkObjects.set(key, { bobs, props });

    } catch (err) {
      console.error(`[WORLD] Chunk ${key} Error:`, err);
    }
  }

  public updatePipeline(useLights: boolean) {
      this.chunkObjects.forEach(obj => {
          obj.props.forEach((sprite: any) => {
              // Shadows are images, props are sprites. Both support pipelines.
              // We typically only want to light the props (sprites), not necessarily shadows which are already dark.
              // However, applying resetPipeline is safe for all.
              if (sprite.type === 'Sprite' || sprite.type === 'Image') {
                  if (useLights) {
                      // Only apply Light2D to sprites that represent objects, maybe skip shadows if desired
                      // For now apply to all props to ensure consistency
                      if (sprite.texture.key !== 'shadow-base') {
                          sprite.setPipeline('Light2D');
                      }
                  } else {
                      sprite.resetPipeline();
                  }
              }
          });
      });
  }

  public destroyChunk(key: string) {
    const obj = this.chunkObjects.get(key);
    if (obj) {
      obj.bobs.forEach(bob => bob.destroy()); 
      obj.props.forEach((p: any) => p.destroy());
      this.chunkObjects.delete(key);
    }
  }

  public shutdown() {
    this.chunkObjects.forEach((_, key) => this.destroyChunk(key));
    if (this.groundBlitter) this.groundBlitter.destroy();
    this.isReady = false;
  }

  public update(time: number) {
      // 1. Atmosphere / Day-Night Cycle
      // Assume gameTime 0-1200. Noon=600.
      // We simulate a sun passing over.
      const cycle = (time * 0.0005) % (Math.PI * 2); // Slow cycle
      
      // Color Grading logic
      // Night (Blue) -> Dawn (Orange) -> Day (White) -> Dusk (Purple)
      const r = Math.floor(100 + Math.sin(cycle) * 50);
      const g = Math.floor(100 + Math.sin(cycle) * 50);
      const b = Math.floor(120 + Math.cos(cycle) * 30);
      this.scene.lights.setAmbientColor(`rgb(${r},${g},${b})`);

      // 2. Y-Sort Loop (The 2.5D Magic)
      const player = this.scene.playerSprite;
      if (player) {
          player.setDepth(player.y);
          if (this.playerLight) {
              this.playerLight.setPosition(player.x, player.y - 20);
              // Torch flicker
              this.playerLight.setIntensity(1.5 + Math.random() * 0.2);
          }
      }

      this.chunkObjects.forEach(obj => {
          obj.props.forEach((sprite: any) => {
              if (sprite.getData && sprite.getData('isSortable')) {
                  sprite.setDepth(sprite.y);
              }
          });
      });
      
      // Mobs Y-Sort
      if (this.scene.mobsPhysicsGroup) {
          this.scene.mobsPhysicsGroup.getChildren().forEach((mob: any) => {
              if(mob.active) mob.setDepth(mob.y);
          });
      }
  }
}
