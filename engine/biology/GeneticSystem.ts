
/**
 * TITAN ENGINE: GENETIC SYSTEM
 * Handles DNA inheritance, mutation, and phenotype expression for living entities.
 */

export interface Genome {
  id: string; // Unique sequence ID
  genes: Float32Array; // Normalized values [0.0 - 1.0] representing specific traits
  generation: number;
  fitness: number; // Calculated based on survival time / kills
}

// Map Gene Index to Gameplay Trait
export const TRAIT_MAP = {
  SCALE: 0,       // Size modifier (0.5x to 1.5x)
  AGGRESSION: 1,  // Attack frequency
  SPEED: 2,       // Movement speed
  COLOR_R: 3,     // Tint Red
  COLOR_G: 4,     // Tint Green
  COLOR_B: 5,     // Tint Blue
  HEALTH: 6,      // Base HP modifier
  DAMAGE: 7       // Base Damage modifier
};

const GENE_COUNT = 8;
const MUTATION_RATE = 0.05; // 5% chance per gene
const MUTATION_STRENGTH = 0.2; // How much a mutation shifts the value

export class GeneticSystem {
  
  /**
   * Creates a random genome for a wild spawn.
   */
  public static createRandomGenome(): Genome {
    const genes = new Float32Array(GENE_COUNT);
    for (let i = 0; i < GENE_COUNT; i++) {
      genes[i] = Math.random();
    }
    
    return {
      id: this.generateId(),
      genes,
      generation: 1,
      fitness: 0
    };
  }

  /**
   * Breeds two parents to create offspring.
   * Uses Uniform Crossover (50% chance from either parent).
   */
  public static breed(parentA: Genome, parentB: Genome): Genome {
    const childGenes = new Float32Array(GENE_COUNT);
    
    for (let i = 0; i < GENE_COUNT; i++) {
      // 1. Inheritance
      let val = Math.random() > 0.5 ? parentA.genes[i] : parentB.genes[i];
      
      // 2. Mutation
      if (Math.random() < MUTATION_RATE) {
        // Shift value by random amount within strength range
        const shift = (Math.random() * 2 - 1) * MUTATION_STRENGTH;
        val = Math.max(0, Math.min(1, val + shift));
      }
      
      childGenes[i] = val;
    }

    return {
      id: this.generateId(),
      genes: childGenes,
      generation: Math.max(parentA.generation, parentB.generation) + 1,
      fitness: 0
    };
  }

  /**
   * Translates DNA into concrete Mob Statistics.
   */
  public static expressPhenotype(genome: Genome, baseStats: any): any {
    const g = genome.genes;
    
    // Scale: 0.8 to 1.5
    const scaleMod = 0.8 + (g[TRAIT_MAP.SCALE] * 0.7);
    
    // Color: RGB
    const r = Math.floor(g[TRAIT_MAP.COLOR_R] * 255);
    const gr = Math.floor(g[TRAIT_MAP.COLOR_G] * 255);
    const b = Math.floor(g[TRAIT_MAP.COLOR_B] * 255);
    const hexColor = (r << 16) | (gr << 8) | b;

    return {
      scale: scaleMod,
      hp: Math.floor(baseStats.hp * (0.5 + g[TRAIT_MAP.HEALTH]) * scaleMod), // Big = Healthier
      damage: Math.floor(baseStats.damage * (0.5 + g[TRAIT_MAP.DAMAGE])),
      speed: baseStats.speed * (1.5 - (scaleMod * 0.3)), // Big = Slower
      aggression: g[TRAIT_MAP.AGGRESSION],
      tint: hexColor
    };
  }

  public static updateFitness(genome: Genome, playerKills: number, survivalTimeSeconds: number) {
    // Fitness Function: Reward aggression and survival
    genome.fitness = (playerKills * 100) + (survivalTimeSeconds * 0.1);
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
