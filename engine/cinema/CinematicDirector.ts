
/**
 * TITAN ENGINE: CINEMATIC DIRECTOR
 * Handles cutscene sequencing, camera splines, and actor orchestration.
 */

export interface Keyframe {
  time: number; // Seconds
  position: Float32Array; // x, y, z
  rotation: Float32Array; // Quaternion or Euler
  fov?: number;
  focusDistance?: number;
}

export interface ActorTrack {
  actorId: string;
  actions: {
    time: number;
    type: 'ANIMATION' | 'MOVE_TO' | 'LOOK_AT';
    payload: any; // Animation Name or Target Position
  }[];
}

export interface CinematicSequence {
  id: string;
  duration: number;
  cameraTrack: Keyframe[];
  actorTracks: ActorTrack[];
  events: { time: number; eventId: string }[];
}

export class CinematicDirector {
  private activeSequence: CinematicSequence | null = null;
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  
  // External hooks (to be connected to Renderer/Scene)
  public onCameraUpdate: ((pos: Float32Array, rot: Float32Array, fov: number) => void) | null = null;
  public onActorCommand: ((id: string, cmd: any) => void) | null = null;
  public onEventTrigger: ((id: string) => void) | null = null;

  private processedEvents: Set<number> = new Set(); // Indices of events fired

  public play(sequence: CinematicSequence) {
    this.activeSequence = sequence;
    this.currentTime = 0;
    this.isPlaying = true;
    this.processedEvents.clear();
    console.log(`[Cinema] Started sequence: ${sequence.id}`);
  }

  public stop() {
    this.isPlaying = false;
    this.activeSequence = null;
  }

  public update(dt: number) {
    if (!this.isPlaying || !this.activeSequence) return;

    this.currentTime += dt;

    if (this.currentTime >= this.activeSequence.duration) {
      this.stop();
      return;
    }

    // 1. Update Camera (Spline Interpolation)
    this.updateCamera();

    // 2. Trigger Actor Actions
    this.updateActors();

    // 3. Trigger Global Events
    this.updateEvents();
  }

  private updateCamera() {
    if (!this.activeSequence || !this.onCameraUpdate) return;
    
    const track = this.activeSequence.cameraTrack;
    if (track.length < 2) return;

    // Find surrounding keyframes
    // Simple implementation: Linear search (optimize with binary search for long tracks)
    let k1 = track[0];
    let k2 = track[track.length - 1];
    
    for (let i = 0; i < track.length - 1; i++) {
      if (this.currentTime >= track[i].time && this.currentTime < track[i+1].time) {
        k1 = track[i];
        k2 = track[i+1];
        break;
      }
    }

    const t = (this.currentTime - k1.time) / (k2.time - k1.time);
    
    // Catmull-Rom would require 4 points (p0, p1, p2, p3). 
    // Here we use simple Linear Interpolation (LERP) for the MVP foundation.
    // Ideally, `evaluateSpline` would be used here.
    
    const pos = this.lerpVec3(k1.position, k2.position, this.ease(t));
    const rot = this.lerpVec3(k1.rotation, k2.rotation, this.ease(t)); // Slerp preferred for Quats
    const fov = (k1.fov || 60) + ((k2.fov || 60) - (k1.fov || 60)) * t;

    this.onCameraUpdate(pos, rot, fov);
  }

  private updateActors() {
    if (!this.activeSequence) return;
    
    // Check for actions that just passed the timestamp
    // Note: In a real engine, we'd process a queue/range to ensure no skipped frames
    for (const track of this.activeSequence.actorTracks) {
      for (const action of track.actions) {
        // Simple discrete trigger logic (assumes actions fire once)
        // Needs state tracking to prevent refiring every frame
        // Here we rely on strict timing or a "fired" flag in a real impl
      }
    }
  }

  private updateEvents() {
    if (!this.activeSequence) return;
    
    this.activeSequence.events.forEach((evt, index) => {
      if (!this.processedEvents.has(index) && this.currentTime >= evt.time) {
        if (this.onEventTrigger) this.onEventTrigger(evt.eventId);
        this.processedEvents.add(index);
      }
    });
  }

  // --- MATH HELPERS ---

  private lerpVec3(a: Float32Array, b: Float32Array, t: number): Float32Array {
    return new Float32Array([
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    ]);
  }

  // Smoothstep easing
  private ease(t: number): number {
    return t * t * (3 - 2 * t);
  }
}
