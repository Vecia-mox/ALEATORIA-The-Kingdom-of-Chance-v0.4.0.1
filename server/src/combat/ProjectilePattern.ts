
/**
 * TITAN ENGINE: PROJECTILE PATTERNS
 * Mathematical generators for Bullet Hell mechanics.
 */

interface ProjectileDef {
  xOffset: number; // Relative to origin
  yOffset: number;
  vx: number;
  vy: number;
  delay: number; // Spawn delay in ms
}

export class ProjectilePattern {
  
  /**
   * Spawns a ring of N projectiles moving outward.
   */
  static nova(count: number, speed: number): ProjectileDef[] {
    const projs: ProjectileDef[] = [];
    const step = (Math.PI * 2) / count;
    
    for (let i = 0; i < count; i++) {
      const angle = i * step;
      projs.push({
        xOffset: 0,
        yOffset: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        delay: 0
      });
    }
    return projs;
  }

  /**
   * Spawns a spinning spiral of projectiles.
   */
  static spiral(count: number, speed: number, spins: number, durationMs: number): ProjectileDef[] {
    const projs: ProjectileDef[] = [];
    const totalAngle = (Math.PI * 2) * spins;
    const stepAngle = totalAngle / count;
    const stepTime = durationMs / count;

    for (let i = 0; i < count; i++) {
      const angle = i * stepAngle;
      projs.push({
        xOffset: 0,
        yOffset: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        delay: i * stepTime
      });
    }
    return projs;
  }

  /**
   * Spawns a linear wall of projectiles with gaps.
   * @param width Total width of the wave
   * @param density Number of projectiles per unit width
   * @param directionAngle Direction of travel in Radians
   * @param gapCount Number of safe spots
   */
  static wave(width: number, count: number, speed: number, directionAngle: number, gapCount: number = 1): ProjectileDef[] {
    const projs: ProjectileDef[] = [];
    
    // Calculate perpendicular vector for placement line
    const px = Math.cos(directionAngle + Math.PI/2);
    const py = Math.sin(directionAngle + Math.PI/2);
    
    const spacing = width / count;
    const gapIndices = new Set<number>();
    
    // Pick random gaps
    for(let g=0; g<gapCount; g++) {
        gapIndices.add(Math.floor(Math.random() * count));
    }

    for (let i = 0; i < count; i++) {
      if (gapIndices.has(i)) continue;

      const offset = (i - count/2) * spacing;
      
      projs.push({
        xOffset: px * offset,
        yOffset: py * offset,
        vx: Math.cos(directionAngle) * speed,
        vy: Math.sin(directionAngle) * speed,
        delay: 0
      });
    }
    return projs;
  }

  /**
   * Targeted Spread (Shotgun).
   */
  static shotgun(count: number, speed: number, arc: number, targetAngle: number): ProjectileDef[] {
    const projs: ProjectileDef[] = [];
    const startAngle = targetAngle - (arc / 2);
    const step = arc / (count - 1);

    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i * step);
      projs.push({
        xOffset: 0,
        yOffset: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        delay: 0
      });
    }
    return projs;
  }
}
