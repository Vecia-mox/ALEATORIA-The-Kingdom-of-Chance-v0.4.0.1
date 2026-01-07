
import { Prop } from '../types';
import { BIOME_REGISTRY } from '../data/BiomeRegistry';

export class PropGenerator {
  
  static generateProps(chunkX: number, chunkY: number, biomeId: string, tileSize: number, chunkSize: number): Prop[] {
    const props: Prop[] = [];
    const biome = BIOME_REGISTRY[biomeId] || BIOME_REGISTRY['PLAINS'];
    
    // Seeded Random Helper (Simple LCG)
    let seed = (chunkX * 73856093) ^ (chunkY * 19349663);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const pixelWidth = chunkSize * tileSize;
    const pixelHeight = chunkSize * tileSize;

    // Determine count based on density
    const area = chunkSize * chunkSize;
    const targetCount = Math.floor(area * biome.propDensity);

    for (let i = 0; i < targetCount; i++) {
        // Random Position in Chunk
        const x = Math.floor(random() * pixelWidth);
        const y = Math.floor(random() * pixelHeight);

        // Pick Prop Type
        const roll = random() * 100;
        let cumulative = 0;
        let selectedProp = biome.props[0];
        
        for (const p of biome.props) {
            cumulative += p.weight;
            if (roll <= cumulative) {
                selectedProp = p;
                break;
            }
        }

        // Slight position jitter to align to pixel grid but not tile grid
        props.push({
            id: `prop-${chunkX}-${chunkY}-${i}`,
            type: selectedProp.type,
            x: x, // Relative to chunk origin
            y: y,
            width: 32, // Estimate, updated by renderer
            height: 32,
            isSolid: selectedProp.isSolid,
            variation: Math.floor(random() * 3)
        });
    }

    // Sort by Y for initial sanity (rendering handles dynamic sort)
    props.sort((a, b) => a.y - b.y);

    return props;
  }
}
