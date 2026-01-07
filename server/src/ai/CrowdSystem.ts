
/**
 * TITAN ENGINE: CROWD SYSTEM
 * Vector Flow Field implementation for massive agent simulation.
 */

export class FlowField {
  public width: number;
  public height: number;
  public cellSize: number;
  public grid: Float32Array; // Stored as interleaved x,y vectors per cell

  constructor(width: number, height: number, cellSize: number) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.grid = new Float32Array(width * height * 2);
  }

  public generate(targetX: number, targetY: number, obstacles: boolean[]) {
    // 1. Integration Field (Dijkstra)
    const costs = new Int32Array(this.width * this.height).fill(999999);
    const tx = Math.floor(targetX / this.cellSize);
    const ty = Math.floor(targetY / this.cellSize);
    
    const queue: number[] = [ty * this.width + tx];
    costs[ty * this.width + tx] = 0;

    const neighbors = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];

    let head = 0;
    while(head < queue.length) {
        const idx = queue[head++];
        const cx = idx % this.width;
        const cy = Math.floor(idx / this.width);
        const currentCost = costs[idx];

        for(const n of neighbors) {
            const nx = cx + n.dx;
            const ny = cy + n.dy;
            
            if(nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                const nIdx = ny * this.width + nx;
                // Check obstacle (impassable cost)
                if (obstacles[nIdx]) continue;

                if (costs[nIdx] > currentCost + 1) {
                    costs[nIdx] = currentCost + 1;
                    queue.push(nIdx);
                }
            }
        }
    }

    // 2. Vector Field (Gradient Descent)
    for(let y=0; y<this.height; y++) {
        for(let x=0; x<this.width; x++) {
            const idx = y * this.width + x;
            if (obstacles[idx]) continue;

            let minCost = costs[idx];
            let vx = 0;
            let vy = 0;

            // Look at neighbors to find steepest descent
            for(const n of neighbors) {
                const nx = x + n.dx;
                const ny = y + n.dy;
                if(nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    const nCost = costs[ny * this.width + nx];
                    if(nCost < minCost) {
                        minCost = nCost;
                        vx = n.dx;
                        vy = n.dy;
                    }
                }
            }
            
            // Store vector
            this.grid[idx * 2] = vx;
            this.grid[idx * 2 + 1] = vy;
        }
    }
  }

  public getVector(worldX: number, worldY: number): {x: number, y: number} {
      const gx = Math.floor(worldX / this.cellSize);
      const gy = Math.floor(worldY / this.cellSize);
      
      if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return {x:0, y:0};
      
      const idx = (gy * this.width + gx) * 2;
      return { x: this.grid[idx], y: this.grid[idx+1] };
  }
}

export class CrowdSystem {
  private flowFields: Map<string, FlowField> = new Map();
  private agents: any[] = [];

  public update(dt: number) {
      for(const agent of this.agents) {
          const flow = this.flowFields.get(agent.targetId);
          if (flow) {
              const dir = flow.getVector(agent.x, agent.y);
              // Apply movement
              agent.vx += dir.x * dt * 50;
              agent.vy += dir.y * dt * 50;
              // Friction
              agent.vx *= 0.9;
              agent.vy *= 0.9;
              
              agent.x += agent.vx * dt;
              agent.y += agent.vy * dt;
          }
      }
  }
}
