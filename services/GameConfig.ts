import Phaser, { Types } from 'phaser';

export const GameConfig: Types.Core.GameConfig = {
  type: Phaser.WEBGL, // Force WebGL to use GPU
  parent: 'phaser-container',
  backgroundColor: '#000000',
  powerPreference: 'high-performance', // Hint browser to use dedicated GPU
  render: {
    pixelArt: true,
    antialias: false,
    batchSize: 4096, // drastically increase sprite batch size (default 2000)
    roundPixels: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      fps: 60,
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // We disable the default DOM structure generation to let React handle the container
  dom: {
    createContainer: false
  }
};