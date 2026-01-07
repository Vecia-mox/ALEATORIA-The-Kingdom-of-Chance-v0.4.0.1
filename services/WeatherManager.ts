
import { GraphicsQuality } from './SettingsManager';

/**
 * WeatherManager handles atmospheric particle effects and overlays.
 * Integrates directly with the Phaser scene and respects the lighting system.
 */
export class WeatherManager {
  private scene: any;
  private rainEmitter: any;
  private ashEmitter: any;
  private fogOverlay: any;
  private currentType: string = 'CLEAR';
  private currentQuality: GraphicsQuality = 'HIGH';

  constructor(scene: any) {
    this.scene = scene;
    this.initSystems();
  }

  private initSystems() {
    const graphics = this.scene.add.graphics();
    
    // Rain Drop Texture
    graphics.clear();
    graphics.fillStyle(0x7dd3fc, 0.4);
    graphics.fillRect(0, 0, 1, 10);
    graphics.generateTexture('weather-rain', 1, 10);

    // Ash/Mote Texture
    graphics.clear();
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('weather-ash', 4, 4);

    // Fog texture
    graphics.clear();
    graphics.fillGradientStyle(0x0f172a, 0x0f172a, 0x020617, 0x020617, 0.3, 0.3, 0.1, 0.1);
    graphics.fillRect(0, 0, 1024, 1024);
    graphics.generateTexture('weather-fog', 1024, 1024);

    graphics.destroy();

    // 1. RAIN SYSTEM (Pooled)
    this.rainEmitter = this.scene.add.particles(0, 0, 'weather-rain', {
      x: { min: -400, max: 2400 },
      y: -100,
      lifespan: 1500,
      speedY: { min: 800, max: 1200 },
      speedX: { min: -100, max: -200 },
      scale: { start: 1, end: 1.5 },
      alpha: { start: 0.6, end: 0.2 },
      quantity: 8,
      emitting: false
    });
    this.rainEmitter.setScrollFactor(0).setDepth(4000);

    // 2. ASH/GLOWSYSTEM
    this.ashEmitter = this.scene.add.particles(0, 0, 'weather-ash', {
      x: { min: 0, max: 2000 },
      y: { min: 0, max: 2000 },
      lifespan: 10000,
      speed: { min: 10, max: 30 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.4, end: 0 },
      emitting: false,
    });
    this.ashEmitter.setDepth(3000);
    
    // 3. FOG OVERLAY
    this.fogOverlay = this.scene.add.tileSprite(0, 0, 3000, 3000, 'weather-fog');
    this.fogOverlay.setAlpha(0);
    this.fogOverlay.setScrollFactor(0.1);
    this.fogOverlay.setDepth(100);
    this.fogOverlay.setBlendMode((window as any).Phaser.BlendModes.MULTIPLY);
  }

  public updateQuality(quality: GraphicsQuality) {
    this.currentQuality = quality;
    if (quality === 'LOW') {
        this.fogOverlay.setVisible(false);
        this.rainEmitter.setVisible(false);
        this.ashEmitter.setVisible(false);
    } else {
        this.fogOverlay.setVisible(true);
        this.rainEmitter.setVisible(true);
        this.ashEmitter.setVisible(true);
        
        // Adjust quantity for Medium vs High
        // We modify the emitter configuration via setQuantity if running, 
        // or just rely on start/stop frequency in setWeather.
        // For simplicity, we just toggle visibility here.
    }
  }

  public update(time: number) {
    if (this.currentQuality === 'LOW') return;

    if (this.fogOverlay && this.fogOverlay.alpha > 0) {
      this.fogOverlay.tilePositionX += 0.3;
      this.fogOverlay.tilePositionY += 0.1;
    }
  }

  public setWeather(type: string) {
    if (this.currentQuality === 'LOW') return;
    if (this.currentType === type) return;
    this.currentType = type;

    const duration = 3000;
    const isMedium = this.currentQuality === 'MEDIUM';

    this.scene.tweens.add({
      targets: [this.rainEmitter, this.ashEmitter, this.fogOverlay],
      alpha: 0,
      duration,
      onComplete: () => {
        if (this.rainEmitter) this.rainEmitter.stop();
        if (this.ashEmitter) this.ashEmitter.stop();
        
        if (type === 'RAIN' && this.rainEmitter) {
          this.rainEmitter.setConfig({ quantity: isMedium ? 4 : 8 });
          this.rainEmitter.start();
          this.scene.tweens.add({ targets: this.rainEmitter, alpha: 1, duration });
        } else if (type === 'ASH' && this.ashEmitter) {
          this.ashEmitter.setConfig({ quantity: isMedium ? 1 : 2 }); // Lower density for medium
          this.ashEmitter.start();
          this.scene.tweens.add({ targets: [this.ashEmitter, this.fogOverlay], alpha: 0.3, duration });
        }
      }
    });
  }
}
