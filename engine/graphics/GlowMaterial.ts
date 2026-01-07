
import * as THREE from 'three';

export class GlowMaterial {
    /**
     * Clones the material of a mesh and makes it emissive (Glowing).
     */
    public static apply(mesh: THREE.Mesh, color: number, intensity: number = 2.0) {
        if (!mesh.material) return;

        // Handle both single material and array of materials
        if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(m => this.makeEmissive(m, color, intensity));
        } else {
            mesh.material = this.makeEmissive(mesh.material as THREE.Material, color, intensity);
        }
    }

    private static makeEmissive(mat: THREE.Material, color: number, intensity: number): THREE.Material {
        // Clone to avoid affecting shared materials
        const m = mat.clone() as THREE.MeshStandardMaterial;
        
        // Set Emissive Properties
        // Note: MeshBasicMaterial doesn't have emissiveIntensity in older Three versions, 
        // but Standard does. If Basic, we swap to Standard or just set Color.
        if (m.type === 'MeshBasicMaterial') {
            // For basic, color acts as emission basically, but we want real light interaction
            const newMat = new THREE.MeshStandardMaterial({ 
                color: m.color,
                map: m.map 
            });
            newMat.emissive = new THREE.Color(color);
            newMat.emissiveIntensity = intensity;
            return newMat;
        }

        m.emissive = new THREE.Color(color);
        m.emissiveIntensity = intensity;
        return m;
    }
}
