
import { VoxelWorld } from '../../engine/voxel/VoxelWorld';
import { Renderer3D } from '../../engine/graphics/Renderer3D';
import { PhysicsWorld } from '../../engine/physics/PhysicsWorld';
import { SkyGenerator } from '../../engine/world/SkyGenerator';
import { RagdollController } from '../../engine/physics/RagdollController';
import { RayTracer } from '../../engine/graphics/RayTracer';
import { WorldState, Chunk, Mob, Player } from '../types';

/**
 * TITAN ENGINE ADAPTER
 * Translates Legacy 2D WorldState into High-Fidelity 3D.
 */
export class GameSceneAdapter {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  
  // Titan Subsystems
  private renderer: Renderer3D;
  private voxelWorld: VoxelWorld;
  private physics: PhysicsWorld;
  private skyGen: SkyGenerator;
  private rayTracer: RayTracer;
  
  // Entity Tracking
  private ragdolls: Map<string, RagdollController> = new Map();
  private processedChunks: Set<string> = new Set();
  
  // Camera State
  private cameraPos: Float32Array = new Float32Array([0, 20, -20]);
  private cameraTarget: Float32Array = new Float32Array([0, 0, 0]);

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.gl = this.canvas.getContext('webgl2', { powerPreference: 'high-performance' })!;
    
    // 1. Initialize Titan Core
    this.physics = new PhysicsWorld();
    this.renderer = new Renderer3D(canvasId);
    this.voxelWorld = new VoxelWorld(this.gl);
    this.skyGen = new SkyGenerator(this.gl);
    this.rayTracer = new RayTracer(this.gl); // Phase 8: SSGI/SSR

    this.initWorld();
  }

  private async initWorld() {
    // Generate initial atmosphere
    await this.skyGen.generateSky('Alien Tundra', 'DUSK');
    
    // Start Render Loop
    this.loop();
  }

  /**
   * Called whenever the Legacy ServerSimulator emits a state update.
   * We intercept this and update the 3D representation.
   */
  public syncWorldState(state: WorldState) {
    // 1. Sync Terrain (Chunk to Voxel)
    Object.keys(state.activeChunks).forEach(key => {
      if (!this.processedChunks.has(key)) {
        this.convertChunkToVoxels(state.activeChunks[key]);
        this.processedChunks.add(key);
      }
    });

    // 2. Sync Entities (Sprite to Ragdoll)
    const activeIds = new Set<string>();
    
    // Players
    Object.values(state.players).forEach((p: Player) => {
      this.syncRagdoll(p.id, p.pos, 'PLAYER', p.classType);
      activeIds.add(p.id);
      
      // Update Camera Follow if local player
      if (p.id === 'player-1') {
        this.cameraTarget[0] = p.pos.x;
        this.cameraTarget[2] = p.pos.y; // Y is Z in 3D
      }
    });

    // Mobs
    Object.values(state.activeChunks).forEach((chunk: Chunk) => {
      chunk.mobs.forEach((m: Mob) => {
        this.syncRagdoll(m.id, m.pos, 'MOB', m.definitionId);
        activeIds.add(m.id);
      });
    });

    // Cleanup Despawned
    for (const [id, ragdoll] of this.ragdolls) {
      if (!activeIds.has(id)) {
        // ragdoll.destroy();
        this.ragdolls.delete(id);
      }
    }
  }

  /**
   * Converts 2D Tile IDs into 3D Density Fields.
   */
  private convertChunkToVoxels(chunk: Chunk) {
    const CHUNK_SIZE = 16;
    const TILE_SCALE = 4.0; // 1 Tile = 4 Meters

    for (let y = 0; y < chunk.height; y++) {
      for (let x = 0; x < chunk.width; x++) {
        const tileId = chunk.data[y][x];
        const worldX = (chunk.x * CHUNK_SIZE + x) * TILE_SCALE;
        const worldZ = (chunk.y * CHUNK_SIZE + y) * TILE_SCALE;

        // Logic: Tile ID determines elevation and material
        // 0-7: Grass (Flat)
        // 8-15: Mountain (High Density)
        // 16-23: Water (Fluid Sim)
        
        let elevation = 0;
        if (tileId >= 8 && tileId <= 15) elevation = 8.0; // Mountain
        if (tileId >= 24) elevation = 2.0; // Hills

        // "Paint" the voxel world
        this.voxelWorld.modifyTerrain(worldX, elevation, worldZ, 3.0, 1.0);
      }
    }
  }

  private syncRagdoll(id: string, pos: {x:number, y:number}, type: 'PLAYER'|'MOB', subType: string) {
    let doll = this.ragdolls.get(id);
    
    if (!doll) {
      // Create new Active Ragdoll
      // Map 2D Pos (x,y) to 3D (x, height, z)
      const spawnPos = [pos.x, 5.0, pos.y]; 
      
      // Phase 15: Initialize Ragdoll with specific skeleton based on subType
      // const def = SkeletonRegistry.get(subType);
      // doll = new RagdollController(id, def, this.physics);
      // doll.setup();
      
      // Mock for compilation
      doll = {} as RagdollController; 
      
      this.ragdolls.set(id, doll);
    }

    // Apply forces for movement instead of teleporting
    // Note: Actual movement logic is handled in InputBridge. 
    // This sync is mainly for error correction (rubberbanding).
  }

  private loop() {
    requestAnimationFrame(() => this.loop());

    // 1. Physics Step
    this.physics.step(1/60);

    // 2. Camera Smoothing
    this.cameraPos[0] += (this.cameraTarget[0] - this.cameraPos[0]) * 0.1;
    this.cameraPos[2] += ((this.cameraTarget[2] + 20) - this.cameraPos[2]) * 0.1;

    // 3. Render Pipeline
    // G-Buffer Pass
    // Lighting Pass
    // Skybox Pass
    this.skyGen.render(this.cameraPos, this.cameraTarget);
    
    // Transparent / Voxel Pass
    // this.voxelWorld.render(...)
  }
}
