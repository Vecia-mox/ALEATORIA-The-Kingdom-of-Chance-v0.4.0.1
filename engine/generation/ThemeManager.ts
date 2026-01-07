
import * as THREE from 'three';

export interface Theme {
    name: string;
    wall: number;
    floor: number;
    fog: number;
    ambient: number;
    light: number;
}

export class ThemeManager {
    
    private static readonly THEMES: Theme[] = [
        // FLOOR 1: THE CRYPT (Red/Brown)
        { 
            name: 'CRYPT', 
            wall: 0x884444, 
            floor: 0x221111, 
            fog: 0x110505, 
            ambient: 0x402020,
            light: 0xffaa00 
        },
        // FLOOR 2: THE SEWER (Green/Slime)
        { 
            name: 'SEWER', 
            wall: 0x446644, 
            floor: 0x112211, 
            fog: 0x051105, 
            ambient: 0x204020,
            light: 0x88ff88 
        },
        // FLOOR 3: THE FROST (Blue/Ice)
        { 
            name: 'FROST', 
            wall: 0x446688, 
            floor: 0x112233, 
            fog: 0x051122, 
            ambient: 0x203050,
            light: 0x88ccff 
        },
        // FLOOR 4: THE VOID (Purple/Dark)
        { 
            name: 'VOID', 
            wall: 0x553355, 
            floor: 0x110511, 
            fog: 0x110011, 
            ambient: 0x301030,
            light: 0xff00ff 
        }
    ];

    public static getTheme(floor: number): Theme {
        const index = (floor - 1) % this.THEMES.length;
        return this.THEMES[index];
    }

    public static apply(scene: THREE.Scene, floor: number) {
        const theme = this.getTheme(floor);
        
        // Update Fog
        scene.fog = new THREE.FogExp2(theme.fog, 0.04);
        scene.background = new THREE.Color(theme.fog);

        // Find Ambient Light and update it
        scene.children.forEach(obj => {
            if (obj instanceof THREE.AmbientLight) {
                obj.color.setHex(theme.ambient);
            }
        });

        console.log(`[ThemeManager] Applied Theme: ${theme.name} (Floor ${floor})`);
    }
}
