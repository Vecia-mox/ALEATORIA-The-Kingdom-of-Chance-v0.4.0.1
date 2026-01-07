
import * as THREE from 'three';

export class MaterialManager {
    
    public static flash(obj: THREE.Object3D) {
        const meshes: THREE.Mesh[] = [];
        
        // Collect all meshes in the group
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                meshes.push(child);
            }
        });

        meshes.forEach(mesh => {
            if (!mesh.material) return;

            // Handle Material Array or Single
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

            materials.forEach(mat => {
                if ('emissive' in mat) {
                    const standardMat = mat as THREE.MeshStandardMaterial;
                    const oldHex = standardMat.emissive.getHex();
                    const oldIntensity = standardMat.emissiveIntensity;

                    // Flash White
                    standardMat.emissive.setHex(0xffffff);
                    standardMat.emissiveIntensity = 1.0;

                    // Restore
                    setTimeout(() => {
                        if (standardMat) {
                            standardMat.emissive.setHex(oldHex);
                            standardMat.emissiveIntensity = oldIntensity;
                        }
                    }, 100);
                }
            });
        });
    }
}
