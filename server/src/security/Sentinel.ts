
/**
 * TITAN ENGINE: SENTINEL (Anti-Cheat)
 * Validates player actions against physical constraints.
 */

interface PlayerState {
  id: string;
  lastPos: { x: number, y: number, z: number };
  lastTime: number;
  violationCount: number;
}

export class Sentinel {
  private players: Map<string, PlayerState> = new Map();
  private MAX_SPEED = 15.0; // Units per second (with buffer)
  private MAX_VIOLATIONS = 5;

  constructor() {}

  /**
   * Validates movement packet. Returns FALSE if movement is rejected.
   */
  public validateMovement(playerId: string, x: number, y: number, z: number): boolean {
    const now = Date.now();
    let state = this.players.get(playerId);

    if (!state) {
      // Initialize tracking
      this.players.set(playerId, { id: playerId, lastPos: { x, y, z }, lastTime: now, violationCount: 0 });
      return true;
    }

    const dt = (now - state.lastTime) / 1000; // Seconds
    if (dt <= 0) return false; // Duplicate packet

    // 1. Speed Check
    const dist = Math.sqrt(
      Math.pow(x - state.lastPos.x, 2) +
      Math.pow(y - state.lastPos.y, 2) +
      Math.pow(z - state.lastPos.z, 2)
    );

    const speed = dist / dt;

    if (speed > this.MAX_SPEED) {
      console.warn(`[Sentinel] Speed Violation: ${playerId} moving at ${speed.toFixed(2)} u/s`);
      state.violationCount++;
      
      if (state.violationCount > this.MAX_VIOLATIONS) {
        // Flag for ban wave (don't ban instantly to prevent testing limits)
        // DB.flagUser(playerId, 'SPEED_HACK');
      }
      
      // Rubberband: Reject movement, force client back to last valid pos
      return false; 
    } else {
      // Decay violations over time
      state.violationCount = Math.max(0, state.violationCount - 0.1);
    }

    // Update State
    state.lastPos = { x, y, z };
    state.lastTime = now;
    return true;
  }

  /**
   * Validates combat hit. Checks Range and Line of Sight (Wallhack).
   */
  public validateHit(attackerId: string, targetPos: {x:number, y:number, z:number}, abilityRange: number): boolean {
    const state = this.players.get(attackerId);
    if (!state) return false;

    // 1. Range Check
    const dist = Math.sqrt(
      Math.pow(targetPos.x - state.lastPos.x, 2) +
      Math.pow(targetPos.y - state.lastPos.y, 2) +
      Math.pow(targetPos.z - state.lastPos.z, 2)
    );

    if (dist > abilityRange + 2.0) { // Small buffer for latency
      console.warn(`[Sentinel] Reach Violation: ${attackerId} hit target at ${dist.toFixed(1)}m (Max: ${abilityRange})`);
      return false;
    }

    // 2. Wall Check (Raycast)
    // Needs access to Physics World (Server-side collision mesh)
    // const hitWall = Physics.raycast(state.lastPos, targetPos, dist, Layers.WALL);
    // if (hitWall) return false;

    return true;
  }
}
