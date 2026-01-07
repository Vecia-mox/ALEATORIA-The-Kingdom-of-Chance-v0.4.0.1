
export interface BiomeDefinition {
  id: string;
  name: string;
  groundTiles: number[]; // Tile IDs from atlas to use as base
  propDensity: number;   // 0.0 to 1.0
  props: { type: string; weight: number; isSolid: boolean }[];
  weather: string;
  ambientColor: number;
}

export const BIOME_REGISTRY: Record<string, BiomeDefinition> = {
  'PLAINS': {
    id: 'PLAINS',
    name: 'Windswept Plains',
    groundTiles: [0, 1], // Grass variants
    propDensity: 0.15,
    props: [
      { type: 'tree_pine', weight: 40, isSolid: true },
      { type: 'shrub', weight: 30, isSolid: false },
      { type: 'rock_grey', weight: 10, isSolid: true },
      { type: 'stump', weight: 5, isSolid: true }
    ],
    weather: 'CLEAR',
    ambientColor: 0x888888
  },
  'FOREST': {
    id: 'FOREST',
    name: 'Deepwood',
    groundTiles: [1], // Forest floor
    propDensity: 0.45,
    props: [
      { type: 'tree_pine', weight: 60, isSolid: true },
      { type: 'tree_dead', weight: 20, isSolid: true },
      { type: 'shrub', weight: 15, isSolid: false },
      { type: 'rock_grey', weight: 5, isSolid: true }
    ],
    weather: 'RAIN',
    ambientColor: 0x666677
  },
  'ASH_WASTES': {
    id: 'ASH_WASTES',
    name: 'Ashen Wastes',
    groundTiles: [3], // Dark ash
    propDensity: 0.10,
    props: [
      { type: 'rock_jagged', weight: 40, isSolid: true },
      { type: 'tree_dead', weight: 30, isSolid: true },
      { type: 'bones', weight: 20, isSolid: false },
      { type: 'ruins_pillar', weight: 10, isSolid: true }
    ],
    weather: 'ASH',
    ambientColor: 0x554444
  },
  'DESERT': {
    id: 'DESERT',
    name: 'Scorched Sands',
    groundTiles: [2], // Sand
    propDensity: 0.08,
    props: [
      { type: 'cactus', weight: 30, isSolid: true },
      { type: 'rock_red', weight: 40, isSolid: true },
      { type: 'bones', weight: 30, isSolid: false }
    ],
    weather: 'CLEAR',
    ambientColor: 0x998877
  }
};
