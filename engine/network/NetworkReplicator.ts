
/**
 * TITAN ENGINE: NETWORK REPLICATOR
 * Handles Snapshot Interpolation and Entity Reconciliation.
 */

export interface EntityState {
  id: string;
  position: [number, number, number]; // x, y, z
  rotation: [number, number, number, number]; // Quaternion
  velocity: [number, number, number];
  timestamp: number;
}

export interface Snapshot {
  id: number;
  timestamp: number;
  entities: EntityState[];
}

export class NetworkReplicator {
  private snapshotBuffer: Snapshot[] = [];
  private static INTERPOLATION_DELAY = 100; // ms behind server to ensure smooth buffer
  private fps: number = 60;

  /**
   * Adds a new server packet to the buffer.
   */
  public pushSnapshot(snapshot: Snapshot) {
    this.snapshotBuffer.push(snapshot);
    // Keep buffer small (e.g., 1 second worth)
    if (this.snapshotBuffer.length > 20) {
      this.snapshotBuffer.shift();
    }
  }

  /**
   * Returns the interpolated transform for a specific entity at the current render time.
   */
  public getInterpolatedState(entityId: string): { pos: Float32Array, rot: Float32Array } | null {
    // 1. Calculate Render Time
    const now = Date.now();
    const renderTime = now - NetworkReplicator.INTERPOLATION_DELAY;

    // 2. Find Snapshots surrounding Render Time
    const shotA = this.snapshotBuffer.find((s, i) => 
      s.timestamp <= renderTime && this.snapshotBuffer[i+1]?.timestamp >= renderTime
    );
    
    if (!shotA) return null; // Buffer empty or lag spike

    const indexA = this.snapshotBuffer.indexOf(shotA);
    const shotB = this.snapshotBuffer[indexA + 1];

    if (!shotB) return null; // End of buffer

    // 3. Find Entity in both snapshots
    const entityA = shotA.entities.find(e => e.id === entityId);
    const entityB = shotB.entities.find(e => e.id === entityId);

    if (!entityA || !entityB) return null;

    // 4. Interpolate
    const timeDelta = shotB.timestamp - shotA.timestamp;
    const progress = (renderTime - shotA.timestamp) / timeDelta;

    return {
      pos: this.lerpVec3(entityA.position, entityB.position, progress),
      rot: this.slerpQuat(entityA.rotation, entityB.rotation, progress)
    };
  }

  // --- MATH HELPERS ---

  private lerpVec3(a: number[], b: number[], t: number): Float32Array {
    return new Float32Array([
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    ]);
  }

  // Simplified Spherical Linear Interpolation
  private slerpQuat(a: number[], b: number[], t: number): Float32Array {
    // Full SLERP implementation omitted for brevity, using LERP for MVP
    // Ideally this uses dot product to find shortest path on 4D sphere
    return new Float32Array([
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
      a[3] + (b[3] - a[3]) * t
    ]);
  }
}
