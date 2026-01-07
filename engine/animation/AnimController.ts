
/**
 * TITAN ENGINE: ANIMATION CONTROLLER
 * State Machine & Blend Tree System for smooth character motion.
 */

export interface AnimClip {
  name: string;
  duration: number;
  // In a real 3D engine, this would hold bone keyframes.
  // For this hybrid engine, it might hold sprite frame indices or transform curves.
  keyframes: any[]; 
}

export type BlendParam = string; // e.g., "Speed", "Direction"

export interface BlendNode {
  clip: AnimClip;
  threshold: number; // Value at which this clip has max weight
}

export class BlendTree {
  constructor(
    public param: BlendParam,
    public nodes: BlendNode[]
  ) {}

  public evaluate(val: number): { clipA: AnimClip, clipB: AnimClip, weight: number } | null {
    // Find two nodes surrounding the current value
    // This allows blending between Idle (0) -> Walk (0.5) -> Run (1.0)
    // Simplified 1D blending logic
    if (this.nodes.length < 2) return null;
    
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i+1];
      if (val >= a.threshold && val <= b.threshold) {
        const range = b.threshold - a.threshold;
        const weight = (val - a.threshold) / range;
        return { clipA: a.clip, clipB: b.clip, weight };
      }
    }
    return { clipA: this.nodes[this.nodes.length-1].clip, clipB: this.nodes[this.nodes.length-1].clip, weight: 1 };
  }
}

export interface AnimState {
  name: string;
  clip?: AnimClip;
  blendTree?: BlendTree;
  loop: boolean;
  onEnter?: () => void;
  onExit?: () => void;
  transitions: Transition[];
}

export interface Transition {
  targetState: string;
  condition: (params: Map<string, any>) => boolean;
  duration: number; // Blending time in seconds
}

export class AnimController {
  private states: Map<string, AnimState> = new Map();
  private currentState: AnimState | null = null;
  private params: Map<string, any> = new Map();
  
  private currentTime: number = 0;
  private transitionTimer: number = 0;
  private previousState: AnimState | null = null;

  public addState(state: AnimState) {
    this.states.set(state.name, state);
    if (!this.currentState) this.currentState = state;
  }

  public setParam(name: string, value: any) {
    this.params.set(name, value);
  }

  public update(dt: number) {
    if (!this.currentState) return;

    this.currentTime += dt;

    // 1. Check Transitions
    for (const trans of this.currentState.transitions) {
      if (trans.condition(this.params)) {
        this.changeState(trans.targetState, trans.duration);
        break;
      }
    }

    // 2. Process Blend Tree
    if (this.currentState.blendTree) {
      const paramName = this.currentState.blendTree.param;
      const val = this.params.get(paramName) || 0;
      const blendResult = this.currentState.blendTree.evaluate(val);
      // Here we would apply the blended transforms to the skeleton
      // applyPose(blendResult.clipA, blendResult.clipB, blendResult.weight);
    } else if (this.currentState.clip) {
      // Standard playback
      // applyPose(this.currentState.clip, this.currentTime);
    }
  }

  private changeState(name: string, duration: number) {
    const next = this.states.get(name);
    if (!next || next === this.currentState) return;

    if (this.currentState.onExit) this.currentState.onExit();
    
    this.previousState = this.currentState;
    this.currentState = next;
    this.currentTime = 0;
    this.transitionTimer = duration;

    if (this.currentState.onEnter) this.currentState.onEnter();
    
    console.log(`[Anim] State Change: ${this.previousState?.name} -> ${this.currentState.name}`);
  }

  public getCurrentStateName(): string {
    return this.currentState?.name || 'None';
  }
}
