
/**
 * TITAN ENGINE: BLUEPRINT SYSTEM
 * Node-based visual scripting runtime.
 */

export type NodeId = string;

export interface NodeContext {
  dt: number;
  vars: Map<string, any>;
  actor: any; // The entity running this script
}

export abstract class BlueprintNode {
  public id: NodeId;
  public inputs: Map<string, any> = new Map();
  public outputs: Map<string, BlueprintNode[]> = new Map(); // Connection Graph

  constructor(id: NodeId) {
    this.id = id;
  }

  abstract execute(ctx: NodeContext): void;

  protected triggerOutput(pinName: string, ctx: NodeContext) {
    const nextNodes = this.outputs.get(pinName);
    if (nextNodes) {
      nextNodes.forEach(node => node.execute(ctx));
    }
  }

  public connect(pinName: string, targetNode: BlueprintNode) {
    if (!this.outputs.has(pinName)) {
      this.outputs.set(pinName, []);
    }
    this.outputs.get(pinName)!.push(targetNode);
  }
}

// --- NODE TYPES ---

export class EventNode extends BlueprintNode {
  constructor(id: NodeId, public eventName: string) {
    super(id);
  }

  execute(ctx: NodeContext): void {
    // Events start the chain
    this.triggerOutput('Out', ctx);
  }
}

export class ConditionNode extends BlueprintNode {
  // Simple comparison for demo: A > B
  execute(ctx: NodeContext): void {
    const valA = this.inputs.get('A');
    const valB = this.inputs.get('B');
    
    if (valA > valB) {
      this.triggerOutput('True', ctx);
    } else {
      this.triggerOutput('False', ctx);
    }
  }
}

export class ActionNode extends BlueprintNode {
  constructor(id: NodeId, private action: (ctx: NodeContext) => void) {
    super(id);
  }

  execute(ctx: NodeContext): void {
    this.action(ctx);
    this.triggerOutput('Out', ctx);
  }
}

// --- GRAPH RUNTIME ---

export class BlueprintGraph {
  private nodes: Map<NodeId, BlueprintNode> = new Map();
  private eventListeners: Map<string, EventNode[]> = new Map();

  public addNode(node: BlueprintNode) {
    this.nodes.set(node.id, node);
    if (node instanceof EventNode) {
      if (!this.eventListeners.has(node.eventName)) {
        this.eventListeners.set(node.eventName, []);
      }
      this.eventListeners.get(node.eventName)!.push(node);
    }
  }

  /**
   * Triggers an event (e.g., 'OnTriggerEnter') which flows through the graph.
   */
  public dispatchEvent(eventName: string, context: NodeContext) {
    const starters = this.eventListeners.get(eventName);
    if (starters) {
      starters.forEach(node => node.execute(context));
    }
  }
}
