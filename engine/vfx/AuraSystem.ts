
import * as THREE from 'three';

interface Wisp {
    mesh: THREE.Mesh;
    speed: number;
    radius: number;
    yOffset: number;
    phase: number;
}

export class AuraSystem {
    private container: THREE.Group;
    private wisps: Wisp[] = [];
    private time: number = 0;

    constructor(parent: THREE.Object3D) {
        this.container = new THREE.Group();
        parent.add(this.container);

        this.initWisps();
    }

    private initWisps() {
        const geometry = new THREE.PlaneGeometry(0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700, 
            transparent: true, 
            opacity: 0.15, 
            side: THREE.DoubleSide, 
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const count = 20;
        for(let i=0; i<count; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            
            // Random properties for organic movement
            const radius = 0.5 + Math.random() * 0.8;
            const yOffset = 0.5 + Math.random() * 1.5;
            const phase = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;

            // Initial position
            mesh.position.set(
                Math.cos(phase) * radius,
                yOffset,
                Math.sin(phase) * radius
            );
            
            // Random rotation
            mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

            this.container.add(mesh);
            this.wisps.push({ mesh, speed, radius, yOffset, phase });
        }
    }

    public update(dt: number) {
        this.time += dt;

        this.wisps.forEach(wisp => {
            // Orbit Logic
            const angle = wisp.phase + (this.time * wisp.speed);
            wisp.mesh.position.x = Math.cos(angle) * wisp.radius;
            wisp.mesh.position.z = Math.sin(angle) * wisp.radius;
            
            // Bobbing Logic (Asynchronous)
            wisp.mesh.position.y = wisp.yOffset + Math.sin(this.time * 2.0 + wisp.phase) * 0.2;

            // Self Rotation (Tumbling)
            wisp.mesh.rotation.x += dt;
            wisp.mesh.rotation.y += dt * 0.5;

            // Pulsing Scale
            const scale = 0.8 + Math.sin(this.time * 3.0 + wisp.phase) * 0.4;
            wisp.mesh.scale.set(scale, scale, scale);
            
            // Billboard effect (Optional: Make them face camera if they weren't tumbling)
            // wisp.mesh.lookAt(cameraPos); 
        });
    }

    public dispose() {
        // Cleanup geometry/material if needed
    }
}
