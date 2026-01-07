
import { Scene, GameObjects } from 'phaser';

export class ObjectPool {
  private static instance: ObjectPool;
  private pools: Map<string, any[]> = new Map();
  private scene: Scene | null = null;

  public static getInstance(scene?: Scene): ObjectPool {
    if (!ObjectPool.instance) {
      ObjectPool.instance = new ObjectPool();
    }
    if (scene) ObjectPool.instance.scene = scene;
    return ObjectPool.instance;
  }

  /**
   * Retrieves an object from the pool or creates a new one.
   * @param type Unique identifier for the pool
   * @param factoryFn Function to create a new object if pool is empty
   */
  public get<T extends GameObjects.GameObject>(type: string, factoryFn: () => T): T {
    if (!this.pools.has(type)) {
      this.pools.set(type, []);
    }

    const pool = this.pools.get(type)!;
    const obj = pool.find(o => !o.active);

    if (obj) {
      obj.setActive(true);
      if ('setVisible' in obj) (obj as any).setVisible(true);
      return obj;
    }

    const newObj = factoryFn();
    pool.push(newObj);
    return newObj;
  }

  /**
   * Returns an object to the pool.
   */
  public release(obj: GameObjects.GameObject) {
    obj.setActive(false);
    if ('setVisible' in obj) (obj as any).setVisible(false);
    if ('body' in obj && obj.body) {
        (obj.body as any).stop();
        (obj.body as any).enable = false; // Disable physics
    }
  }

  /**
   * Cleans up scene references.
   */
  public clear() {
      this.pools.forEach(pool => pool.forEach(obj => obj.destroy()));
      this.pools.clear();
      this.scene = null;
  }
}
