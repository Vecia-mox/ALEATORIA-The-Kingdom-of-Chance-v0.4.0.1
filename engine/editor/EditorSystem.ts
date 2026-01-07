
/**
 * TITAN ENGINE: EDITOR SYSTEM
 * Runtime tools for map creation: Gizmos, Selection, Undo/Redo.
 */

import { PhysicsWorld } from '../physics/PhysicsWorld';

// --- COMMAND PATTERN ---
interface IEditorCommand {
  execute(): void;
  undo(): void;
}

class MoveCommand implements IEditorCommand {
  constructor(
    private entity: any, 
    private oldPos: Float32Array, 
    private newPos: Float32Array
  ) {}

  execute() { this.entity.position = this.newPos; }
  undo() { this.entity.position = this.oldPos; }
}

export class EditorSystem {
  private static instance: EditorSystem;
  private physics: PhysicsWorld;
  
  // State
  private selectedEntityId: string | null = null;
  private gizmoMode: 'TRANSLATE' | 'ROTATE' | 'SCALE' = 'TRANSLATE';
  private undoStack: IEditorCommand[] = [];
  private redoStack: IEditorCommand[] = [];
  
  // Interaction
  private isDragging: boolean = false;
  private dragStartPos: Float32Array = new Float32Array(3);
  private activeGizmoAxis: 'X' | 'Y' | 'Z' | null = null;

  constructor(physics: PhysicsWorld) {
    this.physics = physics;
  }

  public static getInstance(physics?: PhysicsWorld): EditorSystem {
    if (!EditorSystem.instance && physics) EditorSystem.instance = new EditorSystem(physics);
    return EditorSystem.instance;
  }

  // --- SELECTION ---

  public selectObjectAtScreen(x: number, y: number, camera: any) {
    // 1. Unproject Screen Coords to World Ray
    // const ray = camera.screenPointToRay(x, y);
    
    // 2. Physics Raycast
    // const hit = this.physics.raycast(ray.origin, ray.direction, 1000);
    
    // if (hit) {
    //   this.selectedEntityId = hit.entityId;
    //   console.log(`[Editor] Selected: ${hit.entityId}`);
    // } else {
    //   this.selectedEntityId = null;
    // }
  }

  // --- GIZMO LOGIC ---

  public updateGizmo(camera: any, mouseX: number, mouseY: number, isMouseDown: boolean) {
    if (!this.selectedEntityId) return;

    if (isMouseDown && !this.isDragging) {
      // Check raycast against Gizmo Geometry (virtual arrows/rings)
      // For MVP, simplistic check:
      // this.activeGizmoAxis = this.raycastGizmos(camera, mouseX, mouseY);
      
      if (this.activeGizmoAxis) {
        this.isDragging = true;
        // this.dragStartPos = getMouseWorldPosOnPlane(...);
      }
    } else if (!isMouseDown && this.isDragging) {
      // End Drag -> Push Command
      this.isDragging = false;
      this.activeGizmoAxis = null;
      // this.pushCommand(new MoveCommand(...));
    }

    if (this.isDragging && this.activeGizmoAxis) {
      // Calculate delta based on mouse movement projected onto axis
      // Apply transform to selected entity
    }
  }

  // --- HISTORY ---

  public pushCommand(cmd: IEditorCommand) {
    cmd.execute();
    this.undoStack.push(cmd);
    this.redoStack = []; // Clear redo on new action
  }

  public undo() {
    const cmd = this.undoStack.pop();
    if (cmd) {
      cmd.undo();
      this.redoStack.push(cmd);
      console.log('[Editor] Undid action');
    }
  }

  public redo() {
    const cmd = this.redoStack.pop();
    if (cmd) {
      cmd.execute();
      this.undoStack.push(cmd);
      console.log('[Editor] Redid action');
    }
  }

  // --- RENDERING ---
  
  public renderGizmos(renderer: any) {
    if (!this.selectedEntityId) return;
    
    // Get entity transform
    // Draw Axis Arrows (Red=X, Green=Y, Blue=Z)
    // Always render on top (disable depth test for gizmos)
  }
}
