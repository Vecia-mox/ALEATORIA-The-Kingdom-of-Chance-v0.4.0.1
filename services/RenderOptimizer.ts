
import { Scene, GameObjects } from 'phaser';
import { Chunk } from '../types';

export class RenderOptimizer {
  static TILE_SIZE = 32;
  static CHUNK_PIXELS = 1024; // 32 * 32

  /**
   * Bakes a chunk's tilemap data into a single texture.
   * Eliminates tile rendering overhead for static terrain.
   */
  static bakeChunk(scene: Scene, chunk: Chunk, tilesetName: string): GameObjects.Image {
    const key = `baked-chunk-${chunk.id}`;

    // If already baked, return image
    if (scene.textures.exists(key)) {
        const img = scene.add.image(chunk.x * this.CHUNK_PIXELS, chunk.y * this.CHUNK_PIXELS, key);
        img.setOrigin(0, 0);
        img.setDepth(0);
        img.setPipeline('Light2D');
        return img;
    }

    // Create temporary Tilemap to render the data
    const map = scene.make.tilemap({
      data: chunk.data,
      tileWidth: this.TILE_SIZE,
      tileHeight: this.TILE_SIZE,
      width: chunk.width,
      height: chunk.height
    });

    const tileset = map.addTilesetImage(tilesetName, tilesetName, this.TILE_SIZE, this.TILE_SIZE);
    if (!tileset) {
        map.destroy();
        return scene.add.image(0,0,'error'); // Fallback
    }

    const layer = map.createLayer(0, tileset, 0, 0);
    
    // Draw layer to RenderTexture
    const rt = scene.make.renderTexture({ 
        width: chunk.width * this.TILE_SIZE, 
        height: chunk.height * this.TILE_SIZE, 
        add: false 
    });
    
    rt.draw(layer);
    
    // Save as texture and cleanup
    rt.saveTexture(key);
    
    layer.destroy();
    map.destroy();
    rt.destroy();

    const image = scene.add.image(chunk.x * this.CHUNK_PIXELS, chunk.y * this.CHUNK_PIXELS, key);
    image.setOrigin(0, 0);
    image.setDepth(0); // Ground layer
    image.setPipeline('Light2D');

    return image;
  }
}
