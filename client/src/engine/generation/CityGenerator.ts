
export interface RoadSegment {
  start: {x: number, z: number};
  end: {x: number, z: number};
  width: number;
  type: 'ARTERY' | 'STREET';
}

export interface Building {
  position: {x: number, z: number};
  width: number;
  depth: number;
  height: number;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
}

export class CityGenerator {
  private roads: RoadSegment[] = [];
  private buildings: Building[] = [];
  
  // L-System State
  private pendingBranches: any[] = []; // { pos, dir, depth }

  public generate(centerX: number, centerZ: number, size: number) {
    this.roads = [];
    this.buildings = [];
    this.pendingBranches = [{ x: centerX, z: centerZ, dirX: 1, dirZ: 0, depth: 0, type: 'ARTERY' }];

    // 1. Generate Roads
    let iterations = 0;
    while (this.pendingBranches.length > 0 && iterations < 1000) {
      this.processBranch();
      iterations++;
    }

    // 2. Generate Buildings
    this.zoneBuildings();

    return { roads: this.roads, buildings: this.buildings };
  }

  private processBranch() {
    const branch = this.pendingBranches.shift();
    if (branch.depth > 5) return; // Limit city spread

    const length = branch.type === 'ARTERY' ? 100 + Math.random() * 50 : 40 + Math.random() * 20;
    const endX = branch.x + branch.dirX * length;
    const endZ = branch.z + branch.dirZ * length;

    // Check collision with existing roads (Simplified: just checking bounds or simple distance)
    // In a real engine, we'd do line intersection tests here.

    this.roads.push({
      start: { x: branch.x, z: branch.z },
      end: { x: endX, z: endZ },
      width: branch.type === 'ARTERY' ? 12 : 6,
      type: branch.type
    });

    // L-System Rules
    // 1. Continue Forward
    if (Math.random() > 0.1) {
        this.pendingBranches.push({ 
            x: endX, z: endZ, 
            dirX: branch.dirX, dirZ: branch.dirZ, 
            depth: branch.depth, 
            type: branch.type 
        });
    }

    // 2. Branch Out (90 degrees)
    const branchProb = branch.type === 'ARTERY' ? 0.8 : 0.3;
    if (Math.random() < branchProb) {
        const turnAngle = (Math.random() > 0.5 ? 90 : -90) * (Math.PI / 180);
        const newDirX = branch.dirX * Math.cos(turnAngle) - branch.dirZ * Math.sin(turnAngle);
        const newDirZ = branch.dirX * Math.sin(turnAngle) + branch.dirZ * Math.cos(turnAngle);
        
        this.pendingBranches.push({
            x: endX, z: endZ,
            dirX: newDirX, dirZ: newDirZ,
            depth: branch.depth + 1,
            type: 'STREET' // Arteries spawn Streets
        });
    }
  }

  private zoneBuildings() {
    // Walk along roads and place buildings offset from center
    for (const road of this.roads) {
        const dx = road.end.x - road.start.x;
        const dz = road.end.z - road.start.z;
        const len = Math.sqrt(dx*dx + dz*dz);
        const dirX = dx / len;
        const dirZ = dz / len;
        
        // Perpendicular vector
        const perpX = -dirZ;
        const perpZ = dirX;

        const density = Math.floor(len / 15); // Building every 15 units
        
        for (let i = 0; i < density; i++) {
            const t = i / density;
            const px = road.start.x + dx * t;
            const pz = road.start.z + dz * t;

            // Left Side
            if (Math.random() > 0.3) this.addBuilding(px + perpX * (road.width + 5), pz + perpZ * (road.width + 5), road.type);
            // Right Side
            if (Math.random() > 0.3) this.addBuilding(px - perpX * (road.width + 5), pz - perpZ * (road.width + 5), road.type);
        }
    }
  }

  private addBuilding(x: number, z: number, roadType: string) {
      const type = roadType === 'ARTERY' ? 'COMMERCIAL' : 'RESIDENTIAL';
      const height = type === 'COMMERCIAL' ? 50 + Math.random() * 150 : 10 + Math.random() * 20;
      
      this.buildings.push({
          position: { x, z },
          width: 10 + Math.random() * 10,
          depth: 10 + Math.random() * 10,
          height: height,
          type: type as any
      });
  }
}
