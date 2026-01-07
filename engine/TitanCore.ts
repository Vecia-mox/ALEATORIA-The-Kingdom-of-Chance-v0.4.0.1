
import { Renderer3D } from './graphics/Renderer3D';
import { VoxelWorld } from './voxel/VoxelWorld';
import { CameraRig } from './camera/CameraRig';
import { CameraFollow } from './camera/CameraFollow';
import { OcclusionSystem } from './camera/OcclusionSystem';
import { ShakeEffect } from './camera/ShakeEffect';
import { MapAdapter } from './adapters/MapAdapter';
import { PlayerAvatar } from './entities/PlayerAvatar';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { WorldState } from '../types';

/**
 * TITAN ENGINE CORE
 * The central coordinator for the 3D Voxel transition.
 */
export class TitanEngine {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer3D;
  private voxelWorld: VoxelWorld;
  private physics: PhysicsWorld;
  
  // Camera Systems
  private camera: CameraRig;
  private cameraFollow: CameraFollow;
  private occlusion: OcclusionSystem;
  private shake: ShakeEffect;
  
  private mapAdapter: MapAdapter;
  private playerAvatar: PlayerAvatar;
  
  private isRunning: boolean = false;
  private animationId: number = 0;
  private lastTime: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error("TitanEngine: Canvas not found");

    // 1. Initialize Subsystems
    this.renderer = new Renderer3D(canvasId);
    this.physics = new PhysicsWorld();
    this.voxelWorld = new VoxelWorld(this.renderer['gl']); // Access GL context
    
    // 2. Initialize Camera Stack
    this.camera = new CameraRig(this.canvas.width / this.canvas.height);
    this.cameraFollow = new CameraFollow(0, 0, 0);
    this.occlusion = new OcclusionSystem(this.physics);
    this.shake = new ShakeEffect();
    
    // 3. Initialize Adapters
    this.mapAdapter = new MapAdapter(this.voxelWorld);
    this.playerAvatar = new PlayerAvatar(this.renderer);
  }

  public async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    console.log("[TitanEngine] 3D Core Initialized. Starting Render Loop...");
    
    // Load Assets
    await this.playerAvatar.load();

    // Start Loop
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
  }

  public syncState(state: WorldState) {
    if (!state) return;

    // 1. Sync Map
    Object.values(state.activeChunks).forEach(chunk => {
      this.mapAdapter.processChunk(chunk);
    });

    // 2. Sync Player
    const player = state.players['player-1'];
    if (player) {
      // Scale 2D -> 3D
      const x = player.pos.x / 16.0;
      const z = player.pos.y / 16.0; 
      
      this.playerAvatar.updateTransform(x, 0, z, 0);
      
      // Update Camera Target (Logic Target, not actual position)
      this.camera.setTarget(x, 0, z);
    }
  }

  private loop() {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Cap dt
    this.lastTime = now;

    // 1. Physics
    this.physics.step(dt);

    // 2. Camera Update Chain
    // A. Smooth Follow
    const targetPos = this.camera.target;
    const smoothedPos = this.cameraFollow.update(dt, targetPos);
    
    // B. Base Position
    this.camera.setTarget(smoothedPos[0], smoothedPos[1], smoothedPos[2]);
    this.camera.update(); // Recalc matrices based on smoothed target + offset
    
    // C. Shake
    const shakeOffset = this.shake.update(dt);
    this.camera.position[0] += shakeOffset.x;
    this.camera.position[1] += shakeOffset.y;
    // this.camera.rotation... (if supported)

    // D. Occlusion
    this.occlusion.update(this.camera.position, targetPos);

    // 3. Render Frame
    this.renderer.renderFrame(
      this.camera, 
      [this.playerAvatar.getRenderable()], 
      [] 
    );

    this.animationId = requestAnimationFrame(() => this.loop());
  }
}
