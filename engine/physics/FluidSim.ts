
/**
 * TITAN ENGINE: FLUID SIMULATION
 * Cellular Automata based fluid dynamics for discrete grid water/lava.
 */

export enum CellType {
  AIR = 0,
  WALL = 1,
  WATER = 2,
  LAVA = 3,
  STONE = 4,
  STEAM = 5
}

export class FluidSim {
  private width: number;
  private height: number;
  private size: number;
  
  // Double buffer state for CA
  private gridType: Uint8Array;
  private gridMass: Float32Array;
  private nextType: Uint8Array;
  private nextMass: Float32Array;

  // Config
  private MIN_MASS = 0.01;
  private MAX_MASS = 1.0;
  private COMPRESSION = 0.25; // How much mass flows per step

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    
    this.gridType = new Uint8Array(this.size);
    this.gridMass = new Float32Array(this.size);
    this.nextType = new Uint8Array(this.size);
    this.nextMass = new Float32Array(this.size);
  }

  public addFluid(x: number, y: number, type: CellType, amount: number) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = y * this.width + x;
    
    if (this.gridType[idx] === CellType.AIR || this.gridType[idx] === type) {
      this.gridType[idx] = type;
      this.gridMass[idx] = Math.min(this.MAX_MASS, this.gridMass[idx] + amount);
    }
  }

  public update() {
    // 1. Reset Next State (Copy logic or clear)
    this.nextMass.set(this.gridMass);
    this.nextType.set(this.gridType);

    // 2. Iterate Grid (Bottom Up)
    for (let y = this.height - 1; y >= 0; y--) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const type = this.gridType[idx];
        const mass = this.gridMass[idx];

        if (mass <= this.MIN_MASS || type === CellType.WALL || type === CellType.STONE) continue;

        let remainingMass = mass;

        // A. Flow Down
        if (y < this.height - 1) {
          const downIdx = (y + 1) * this.width + x;
          const flow = this.calculateFlow(mass, this.gridMass[downIdx], this.gridType[downIdx]);
          if (flow > 0) {
            remainingMass -= flow;
            this.moveFluid(idx, downIdx, flow, type);
          }
        }

        if (remainingMass <= this.MIN_MASS) continue;

        // B. Flow Left
        if (x > 0) {
          const leftIdx = y * this.width + (x - 1);
          const flow = this.calculateFlow(remainingMass, this.gridMass[leftIdx], this.gridType[leftIdx]);
          if (flow > 0) {
            remainingMass -= flow;
            this.moveFluid(idx, leftIdx, flow, type);
          }
        }

        if (remainingMass <= this.MIN_MASS) continue;

        // C. Flow Right
        if (x < this.width - 1) {
          const rightIdx = y * this.width + (x + 1);
          const flow = this.calculateFlow(remainingMass, this.gridMass[rightIdx], this.gridType[rightIdx]);
          if (flow > 0) {
            remainingMass -= flow;
            this.moveFluid(idx, rightIdx, flow, type);
          }
        }
        
        // D. Interaction (Lava + Water)
        this.checkReactions(idx, x, y);
      }
    }

    // 3. Swap Buffers
    this.gridMass.set(this.nextMass);
    this.gridType.set(this.nextType);
  }

  private calculateFlow(sourceMass: number, destMass: number, destType: CellType): number {
    if (destType === CellType.WALL || destType === CellType.STONE) return 0;
    if (destMass >= sourceMass) return 0;
    
    // Equalize pressure
    const flow = (sourceMass - destMass) / 4;
    return Math.max(0, flow > this.MIN_MASS ? flow : 0);
  }

  private moveFluid(sourceIdx: number, destIdx: number, amount: number, type: CellType) {
    // Commit changes to NEXT buffer to keep simulation atomic per step
    this.nextMass[sourceIdx] -= amount;
    this.nextMass[destIdx] += amount;
    this.nextType[destIdx] = type;

    // Cleanup source if empty
    if (this.nextMass[sourceIdx] <= this.MIN_MASS) {
      this.nextType[sourceIdx] = CellType.AIR;
      this.nextMass[sourceIdx] = 0;
    }
  }

  private checkReactions(idx: number, x: number, y: number) {
    const type = this.gridType[idx];
    if (type !== CellType.LAVA && type !== CellType.WATER) return;

    // Check 4 neighbors
    const neighbors = [
      (y > 0) ? (y-1)*this.width+x : -1,
      (y < this.height-1) ? (y+1)*this.width+x : -1,
      (x > 0) ? y*this.width+(x-1) : -1,
      (x < this.width-1) ? y*this.width+(x+1) : -1
    ];

    for (const nIdx of neighbors) {
      if (nIdx === -1) continue;
      const nType = this.gridType[nIdx];
      
      // Lava + Water = Stone
      if ((type === CellType.LAVA && nType === CellType.WATER) || 
          (type === CellType.WATER && nType === CellType.LAVA)) {
        
        // Turn this cell into Stone
        this.nextType[idx] = CellType.STONE;
        this.nextMass[idx] = 1.0;
        
        // Steam Effect (Turn water neighbor to steam or air)
        if (nType === CellType.WATER) {
           this.nextType[nIdx] = CellType.STEAM;
           this.nextMass[nIdx] = 0.5;
        }
      }
    }
  }
}
