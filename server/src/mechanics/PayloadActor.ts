
/**
 * TITAN ENGINE: PAYLOAD ACTOR
 * Logic for the "Haunted Carriage".
 * Moves along a spline path only when players are nearby.
 */

import { Position } from '../../types';

export interface Waypoint {
  x: number;
  y: number;
  triggerWave?: boolean; // Spawn mobs when reaching this point
}

export class PayloadActor {
  public id: string;
  public position: Position;
  
  private path: Waypoint[];
  private currentWaypointIndex: number = 0;
  private speed: number = 4.0; // Units per tick
  private progress: number = 0; // 0.0 to 1.0 (Distance to next waypoint)
  
  // Escort Config
  private readonly DETECTION_RADIUS = 300; // Pixels
  private isActive: boolean = false;

  constructor(id: string, path: Waypoint[]) {
    this.id = id;
    this.path = path;
    this.position = { ...path[0] };
  }

  public update(dt: number, nearbyPlayerPositions: Position[]): { moved: boolean, spawnWave: boolean } {
    if (this.currentWaypointIndex >= this.path.length - 1) {
      return { moved: false, spawnWave: false }; // Finished
    }

    // 1. Proximity Check
    const playersNearby = nearbyPlayerPositions.some(p => {
        const dx = p.x - this.position.x;
        const dy = p.y - this.position.y;
        return (dx*dx + dy*dy) < (this.DETECTION_RADIUS * this.DETECTION_RADIUS);
    });

    if (!playersNearby) {
        return { moved: false, spawnWave: false };
    }

    // 2. Move along spline
    const start = this.path[this.currentWaypointIndex];
    const end = this.path[this.currentWaypointIndex + 1];
    
    const segmentDist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const step = (this.speed * dt * 10) / segmentDist; // Normalized step

    this.progress += step;

    if (this.progress >= 1.0) {
      // Reached Waypoint
      this.currentWaypointIndex++;
      this.progress = 0;
      this.position = { ...end };
      
      const shouldSpawn = end.triggerWave || false;
      return { moved: true, spawnWave: shouldSpawn };
    } else {
      // Interpolate
      this.position.x = start.x + (end.x - start.x) * this.progress;
      this.position.y = start.y + (end.y - start.y) * this.progress;
      return { moved: true, spawnWave: false };
    }
  }

  public getCompletionPercentage(): number {
    return Math.floor((this.currentWaypointIndex / (this.path.length - 1)) * 100);
  }
}
