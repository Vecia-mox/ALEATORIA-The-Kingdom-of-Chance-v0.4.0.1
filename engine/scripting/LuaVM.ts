
/**
 * TITAN ENGINE: LUA VM (Simulated via Web Worker)
 * Provides a secure sandbox for user-generated scripts.
 */

// Worker Code (Inline for portability in scaffold)
const WORKER_CODE = `
  self.onmessage = function(e) {
    const { type, code, eventData } = e.data;

    if (type === 'INIT') {
      self.gameContext = {}; // Shared state
    }

    if (type === 'EXECUTE') {
      try {
        // Sandboxed Execution Scope
        const Game = {
          log: (msg) => self.postMessage({ type: 'LOG', msg }),
          spawn: (id, x, y, z) => self.postMessage({ type: 'CMD', cmd: 'SPAWN', args: [id, x, y, z] }),
          getPlayers: () => [], // Mock
        };
        
        // Eval is dangerous in main thread, but isolated in Worker it's safer 
        // (still needs sanitation in prod)
        const userFunc = new Function('Game', code);
        userFunc(Game);
        
      } catch (err) {
        self.postMessage({ type: 'ERROR', msg: err.toString() });
      }
    }
  };
`;

export class LuaVM {
  private worker: Worker;
  private eventListeners: Map<string, string[]> = new Map(); // Event -> Script IDs

  constructor() {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
    
    this.worker.onmessage = (e) => this.handleWorkerMessage(e.data);
    this.worker.postMessage({ type: 'INIT' });
  }

  public loadModScript(scriptContent: string) {
    // In a real engine, we'd parse the script for event hooks like 'Game.on("Start", ...)'
    // For now, we just execute it immediately
    this.worker.postMessage({ type: 'EXECUTE', code: scriptContent });
  }

  private handleWorkerMessage(data: any) {
    switch (data.type) {
      case 'LOG':
        console.log(`[Mod] ${data.msg}`);
        break;
      case 'ERROR':
        console.error(`[Mod Error] ${data.msg}`);
        break;
      case 'CMD':
        this.executeEngineCommand(data.cmd, data.args);
        break;
    }
  }

  private executeEngineCommand(cmd: string, args: any[]) {
    // Bridge between Sandbox and Main Engine
    if (cmd === 'SPAWN') {
      const [id, x, y, z] = args;
      console.log(`[Engine] Mod requested spawn: ${id} at ${x},${y},${z}`);
      // EntityManager.spawn(id, {x,y,z});
    }
  }

  public terminate() {
    this.worker.terminate();
  }
}
