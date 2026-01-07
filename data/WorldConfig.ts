
export const WorldConfig = {
  CHUNK_SIZE: 16, // Tiles per chunk side (16x16 grid)
  TILE_SIZE: 64,  // Pixels per tile (High Res)
  CHUNK_PIXELS: 1024, // 16 * 64 = 1024px
  SEED: 12345,    // Fixed seed for consistent worlds
  
  // Fractal Noise Config (FBM)
  NOISE_SCALE: 0.02,   // Base zoom level (Lower = larger continents)
  OCTAVES: 6,          // Layers of detail (1 = Blobby, 6 = Detailed)
  PERSISTENCE: 0.5,    // How much amplitude decreases per octave
  LACUNARITY: 2.0,     // How much frequency increases per octave
  
  // Biome Elevation Thresholds (0.0 to 1.0)
  WATER_LEVEL: 0.35,
  SHORE_LEVEL: 0.38,
  SAND_LEVEL: 0.42,
  MOUNTAIN_LEVEL: 0.75,
  
  FOREST_DENSITY: 0.55, // Moisture threshold for trees
};
