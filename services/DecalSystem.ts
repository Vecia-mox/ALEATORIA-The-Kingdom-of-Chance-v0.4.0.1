
import { Scene, GameObjects } from 'phaser';

/**
 * DecalSystem manages persistent environmental details like blood and scorch marks.
 * Uses a RenderTexture to efficiently draw many static sprites into a single texture.
 */
export class DecalSystem {
  private scene: Scene;
  private rt: GameObjects.RenderTexture;
  private timer: number = 0;
  private readonly CLEAR_INTERVAL = 60000; // 60 seconds

  constructor(scene: Scene) {
    this.scene = scene;
    
    // Create a large render texture covering the typical play area
    // Depth 9 puts it above the ground (layer 0) but below items/mobs (layer 1500)
    // Pipeline 'Light2D' allows decals to be affected by darkness/torches
    this.rt = scene.add.renderTexture(0, 0, 4096, 4096).setDepth(9);
    this.rt.setPipeline('Light2D');
  }

  /**
   * Stamps a decal onto the world surface.
   * @param x World X
   * @param y World Y
   * @param type 'blood' or 'scorch'
   */
  public addDecal(x: number, y: number, type: 'blood' | 'scorch') {
    const texture = type === 'blood' ? 'decal-blood' : 'decal-scorch';
    const rotation = Math.random() * Math.PI * 2;
    const scale = 0.8 + Math.random() * 0.5;
    
    // Draw the texture frame into the Render Texture at the given position
    this.rt.draw(texture, x, y, 1, 0xffffff);
    
    // NOTE: direct .draw parameters are (texture, x, y, alpha). 
    // To handle rotation/scale, we need a temporary game object or use .drawFrame.
    // Simpler approach for variety:
    const stamp = this.scene.make.image({ key: texture, add: false }, false);
    stamp.setRotation(rotation);
    stamp.setScale(scale);
    stamp.setPosition(x, y);
    if (type === 'blood') stamp.setAlpha(0.8);
    
    this.rt.draw(stamp, x, y);
    stamp.destroy();
  }

  public update(delta: number) {
    this.timer += delta;
    if (this.timer > this.CLEAR_INTERVAL) {
      // Fade out effect simulation (naive clear for now)
      this.rt.clear();
      this.timer = 0;
    }
  }
}
