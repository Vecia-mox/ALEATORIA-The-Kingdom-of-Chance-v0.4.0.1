
import * as THREE from 'three';

export class VoidNet {
    // Bounds definitions
    private static readonly LIMIT_Y_LOW = -50;
    private static readonly LIMIT_Y_HIGH = 50;
    private static readonly LIMIT_XZ = 1000;

    public static check(obj: THREE.Object3D, name: string = 'Entity') {
        const { x, y, z } = obj.position;

        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            console.error(`⚠️ [VoidNet] ${name} coordinates are NaN! Reseting.`);
            this.reset(obj);
            return;
        }

        const outOfBounds = 
            y < this.LIMIT_Y_LOW || 
            y > this.LIMIT_Y_HIGH || 
            Math.abs(x) > this.LIMIT_XZ || 
            Math.abs(z) > this.LIMIT_XZ;

        if (outOfBounds) {
            console.warn(`⚠️ [VoidNet] ${name} fell into the void at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}). Respawing.`);
            this.reset(obj);
        }
    }

    private static reset(obj: THREE.Object3D) {
        // Reset to spawn point
        obj.position.set(0, 2, 0); // Drop from slight height
        
        // Reset Physics
        if (obj.userData.velocity) {
            obj.userData.velocity.set(0, 0, 0);
        }
    }
}
