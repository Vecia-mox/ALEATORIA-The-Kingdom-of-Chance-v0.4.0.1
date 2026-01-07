
import { AssetLoader } from './AssetLoader';

/**
 * TITAN ENGINE: ASSET MANAGER
 * Central registry for all 3D game assets.
 * Ensures models are preloaded before the world renders.
 */
export class AssetManager {
  private static instance: AssetManager;
  private loader: AssetLoader;

  // Asset Manifest (Gothic/Diablo Aesthetic)
  private readonly ASSETS = {
    // Characters
    'Barbarian_Skin': 'assets/models/chars/barbarian_t1.glb',
    
    // Environment - Crypt Set
    'Floor_Stone': 'assets/models/env/dungeon_floor_04.glb',
    'Wall_Crypt': 'assets/models/env/crypt_wall_02.glb',
    
    // Props & FX
    'Sword_T1': 'assets/models/items/weapon_sword_rusty.glb',
    'VFX_Slash': 'assets/models/vfx/trail_mesh.glb'
  };

  private constructor() {
    this.loader = AssetLoader.getInstance();
  }

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) AssetManager.instance = new AssetManager();
    return AssetManager.instance;
  }

  /**
   * Preloads all core assets required for the initial scene.
   * Blocks entry until completion to prevent popping.
   */
  public async loadCoreAssets(): Promise<void> {
    console.log("[AssetManager] Starting Core Asset Load...");
    
    const promises = Object.entries(this.ASSETS).map(([key, url]) => {
      // Force High LOD (0) for hero assets close to camera
      return this.loader.loadModelLOD(url, 0); 
    });

    await Promise.all(promises);
    console.log("[AssetManager] Core Assets Ready.");
  }

  public getAssetUrl(key: keyof typeof this.ASSETS): string {
    return this.ASSETS[key];
  }
}
