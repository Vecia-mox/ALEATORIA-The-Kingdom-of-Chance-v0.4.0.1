
/**
 * TITAN ENGINE: BEHAVIOR TREE AI
 * Modular AI decision making system.
 */

export enum NodeStatus {
  SUCCESS,
  FAILURE,
  RUNNING
}

export class Blackboard {
  private data: Map<string, any> = new Map();

  set(key: string, value: any) { this.data.set(key, value); }
  get<T>(key: string): T { return this.data.get(key); }
  has(key: string): boolean { return this.data.has(key); }
  delete(key: string) { this.data.delete(key); }
}

export abstract class BehaviorNode {
  abstract tick(dt: number, blackboard: Blackboard): NodeStatus;
}

// --- COMPOSITES (Flow Control) ---

export abstract class Composite extends BehaviorNode {
  protected children: BehaviorNode[] = [];

  constructor(children: BehaviorNode[] = []) {
    super();
    this.children = children;
  }

  addChild(node: BehaviorNode) {
    this.children.push(node);
  }
}

/**
 * Selector: OR Logic. Runs children until one SUCCEEDS.
 * Used for choosing a behavior (e.g. Fight OR Patrol OR Idle).
 */
export class Selector extends Composite {
  tick(dt: number, blackboard: Blackboard): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(dt, blackboard);
      if (status !== NodeStatus.FAILURE) {
        return status;
      }
    }
    return NodeStatus.FAILURE;
  }
}

/**
 * Sequence: AND Logic. Runs children until one FAILS.
 * Used for chains of actions (e.g. Find Target -> Move To -> Attack).
 */
export class Sequence extends Composite {
  tick(dt: number, blackboard: Blackboard): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(dt, blackboard);
      if (status !== NodeStatus.SUCCESS) {
        return status;
      }
    }
    return NodeStatus.SUCCESS;
  }
}

// --- DECORATORS (Conditionals) ---

export abstract class Decorator extends BehaviorNode {
  constructor(protected child: BehaviorNode) { super(); }
}

/**
 * Inverter: Flips Success/Failure.
 */
export class Inverter extends Decorator {
  tick(dt: number, blackboard: Blackboard): NodeStatus {
    const status = this.child.tick(dt, blackboard);
    if (status === NodeStatus.SUCCESS) return NodeStatus.FAILURE;
    if (status === NodeStatus.FAILURE) return NodeStatus.SUCCESS;
    return NodeStatus.RUNNING;
  }
}

/**
 * Cooldown: Blocks execution if triggered too recently.
 */
export class Cooldown extends Decorator {
  private lastRunTime: number = 0;

  constructor(private durationMs: number, child: BehaviorNode) {
    super(child);
  }

  tick(dt: number, blackboard: Blackboard): NodeStatus {
    const now = Date.now();
    if (now - this.lastRunTime < this.durationMs) {
      return NodeStatus.FAILURE;
    }
    
    const status = this.child.tick(dt, blackboard);
    if (status === NodeStatus.SUCCESS || status === NodeStatus.RUNNING) {
      this.lastRunTime = now;
    }
    return status;
  }
}

// --- TASKS (Leaves) ---

export class Task extends BehaviorNode {
  constructor(private action: (dt: number, bb: Blackboard) => NodeStatus) {
    super();
  }

  tick(dt: number, blackboard: Blackboard): NodeStatus {
    return this.action(dt, blackboard);
  }
}
