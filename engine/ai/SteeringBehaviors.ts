
import * as THREE from 'three';

export class SteeringBehaviors {
    private static raycaster = new THREE.Raycaster();
    
    public static avoidObstacles(
        agentPos: THREE.Vector3, 
        agentDir: THREE.Vector3, 
        obstacles: THREE.Group
    ): THREE.Vector3 {
        const avoidForce = new THREE.Vector3();
        
        // 3 Rays: Center, Left 30, Right 30
        const whiskers = [
            agentDir.clone(),
            agentDir.clone().applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/6),
            agentDir.clone().applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/6)
        ];

        // Only react to the first significant hit
        let hitFound = false;

        for (let i = 0; i < whiskers.length; i++) {
            if (hitFound) break;

            const dir = whiskers[i].normalize();
            // Start ray slightly above ground to hit walls
            const origin = agentPos.clone().add(new THREE.Vector3(0, 1, 0)); 
            
            this.raycaster.set(origin, dir);
            // Shallow intersect check is faster
            const intersects = this.raycaster.intersectObjects(obstacles.children, false);

            if (intersects.length > 0 && intersects[0].distance < 2.0) {
                // Determine turn direction
                // If Center hit -> Turn Left Hard
                // If Left hit -> Turn Right
                // If Right hit -> Turn Left
                
                const turnStrength = 3.0;
                const turnDir = new THREE.Vector3(0, 1, 0); // Up axis

                if (i === 0) { // Center
                    avoidForce.copy(agentDir).cross(turnDir).multiplyScalar(turnStrength); 
                } else if (i === 1) { // Left
                    avoidForce.copy(agentDir).cross(turnDir).multiplyScalar(-turnStrength);
                } else { // Right
                    avoidForce.copy(agentDir).cross(turnDir).multiplyScalar(turnStrength);
                }
                
                hitFound = true;
            }
        }

        return avoidForce;
    }
}
