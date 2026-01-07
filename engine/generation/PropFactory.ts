
import * as THREE from 'three';

export class PropFactory {
    // Reusable Geometries/Materials for performance
    private static matWood = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    private static matIron = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.8 });
    private static matStone = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 });

    public static createBarrel(x: number, z: number): THREE.Group {
        const group = new THREE.Group();
        group.position.set(x, 0.4, z); // Center pivot

        // Main Body
        const geoBody = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
        const body = new THREE.Mesh(geoBody, this.matWood);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Iron Bands
        const geoBand = new THREE.TorusGeometry(0.31, 0.03, 4, 8);
        const bandTop = new THREE.Mesh(geoBand, this.matIron);
        bandTop.rotation.x = Math.PI / 2;
        bandTop.position.y = 0.2;
        group.add(bandTop);

        const bandBot = new THREE.Mesh(geoBand, this.matIron);
        bandBot.rotation.x = Math.PI / 2;
        bandBot.position.y = -0.2;
        group.add(bandBot);

        // Physics UserData (Solid)
        group.userData = { isObstacle: true, radius: 0.4 };

        return group;
    }

    public static createCrate(x: number, z: number): THREE.Mesh {
        const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const mesh = new THREE.Mesh(geo, this.matWood);
        
        mesh.position.set(x, 0.3, z);
        mesh.rotation.y = Math.random() * Math.PI; // Random rotation
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Physics UserData (Solid)
        mesh.userData = { isObstacle: true, radius: 0.5 };

        return mesh;
    }

    public static createRubble(x: number, z: number): THREE.Group {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const geoPebble = new THREE.DodecahedronGeometry(0.1);
        
        // Scatter 3 rocks
        for(let i=0; i<3; i++) {
            const mesh = new THREE.Mesh(geoPebble, this.matStone);
            mesh.position.set(
                (Math.random() - 0.5) * 0.5,
                0.05,
                (Math.random() - 0.5) * 0.5
            );
            mesh.rotation.set(Math.random(), Math.random(), Math.random());
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
        }

        // Rubble is walkable (No isObstacle)
        return group;
    }
}
