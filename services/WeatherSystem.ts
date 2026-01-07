
import { Scene, GameObjects } from 'phaser';

/**
 * WeatherSystem handles biome-specific atmospheric effects.
 * Supports: Rain, Ash, Fog.
 */
export class WeatherSystem {
  private scene: Scene;
  private particles: GameObjects.Particles.ParticleEmitterManager;
  private rainEmitter: GameObjects.Particles.ParticleEmitter;
  private ashEmitter: GameObjects.Particles.ParticleEmitter;
  private fogOverlay: GameObjects.TileSprite;
  
  private currentBiome: string = 'PLAINS';

  constructor(scene: Scene) {
    this.scene = scene;
    
    // Initialize Graphics if not already present
    this.initTextures();

    // Fog Overlay (Screen Space)
    this.fogOverlay = this.scene.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'weather-fog');
    this.fogOverlay.setScrollFactor(0); // Sticks to camera
    this.fogOverlay.setDepth(4000);
    // Use window.Phaser to avoid compilation error if Phaser global isn't typed or imported as value
    this.fogOverlay.setBlendMode((window as any).Phaser.BlendModes.ADD);
    this.fogOverlay.setAlpha(0);

    // Emitters
    // Note: In Phaser 3.60+, structure is Scene.add.particles(x, y, texture, config)
    // We create a manager first? Phaser 3.60 simplified this.
    // Creating emitter directly.
    this.rainEmitter = this.scene.add.particles(0, 0, 'weather-rain', {
        x: { min: 0, max: window.innerWidth },
        y: -50,
        lifespan: 1000,
        speedY: { min: 600, max: 900 },
        speedX: { min: -100, max: -200 }, // Slant
        scaleY: { min: 1, max: 2 },
        quantity: 0, // Controlled via flow/frequency
        frequency: 100, // Ms per emission
        emitting: false
    });
    this.rainEmitter.setScrollFactor(0).setDepth(4001);

    this.ashEmitter = this.scene.add.particles(0, 0, 'weather-ash', {
        x: { min: 0, max: window.innerWidth },
        y: { min: 0, max: window.innerHeight },
        lifespan: 4000,
        speedY: { min: 10, max: 50 },
        speedX: { min: -20, max: 20 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.8, end: 0 },
        quantity: 0,
        emitting: false
    });
    this.ashEmitter.setScrollFactor(0).setDepth(4001);
  }

  private initTextures() {
      if (!this.scene.textures.exists('weather-rain')) {
          const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
          g.fillStyle(0xa5f3fc, 0.6);
          g.fillRect(0, 0, 2, 12);
          g.generateTexture('weather-rain', 2, 12);
          g.clear();
          
          g.fillStyle(0xffffff, 0.8);
          g.fillCircle(2, 2, 2);
          g.generateTexture('weather-ash', 4, 4);
          g.clear();

          // Fog Texture (Gradient Blob)
          g.fillGradientStyle(0xffffff, 0xffffff, 0x000000, 0x000000, 0.2, 0.2, 0, 0);
          g.fillCircle(128, 128, 128);
          g.generateTexture('weather-fog', 256, 256);
          g.destroy();
      }
  }

  public setBiome(biome: string) {
      if (this.currentBiome === biome) return;
      this.currentBiome = biome;
      
      // Reset
      this.rainEmitter.stop();
      this.ashEmitter.stop();
      this.scene.tweens.add({ targets: this.fogOverlay, alpha: 0, duration: 2000 });

      // Apply
      if (biome === 'ASH_WASTES') {
          this.ashEmitter.start();
          this.ashEmitter.setFrequency(200);
          this.scene.tweens.add({ targets: this.fogOverlay, alpha: 0.1, tint: 0xffaa00, duration: 2000 });
      } else if (biome === 'SWAMP') {
          this.scene.tweens.add({ targets: this.fogOverlay, alpha: 0.3, tint: 0x10b981, duration: 2000 });
      } else if (biome === 'MOUNTAIN') {
          // Re-use ash as snow
          this.ashEmitter.setTexture('weather-ash');
          this.ashEmitter.start();
          this.ashEmitter.setFrequency(50);
          this.scene.tweens.add({ targets: this.fogOverlay, alpha: 0.2, tint: 0xffffff, duration: 2000 });
      } else if (biome === 'RAIN_FOREST') {
          this.rainEmitter.start();
          this.rainEmitter.setFrequency(10); // Heavy rain
      }
  }

  public update(time: number, delta: number) {
      this.fogOverlay.tilePositionX += 0.02 * delta;
  }
}
