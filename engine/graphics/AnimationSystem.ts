
import { HumanoidRig } from './HeroModel';

export class AnimationSystem {
    
    public static update(model: HumanoidRig, speed: number, isAttacking: boolean, time: number) {
        // 1. LEGS (Locomotion)
        this.animateLegs(model, speed, time);

        // 2. TORSO & ARMS (Action)
        if (isAttacking) {
            this.animateAttack(model, time);
        } else {
            this.animateIdleOrWalk(model, speed, time);
        }
    }

    private static animateLegs(model: HumanoidRig, speed: number, time: number) {
        if (speed > 0.1) {
            const freq = 12;
            const amp = 0.8;
            
            // Alternating leg swing
            model.leftLeg.rotation.x = Math.sin(time * freq) * amp;
            model.rightLeg.rotation.x = Math.sin(time * freq + Math.PI) * amp;
        } else {
            // Stand still
            model.leftLeg.rotation.x = 0;
            model.rightLeg.rotation.x = 0;
        }
    }

    private static animateAttack(model: HumanoidRig, time: number) {
        // Attack Animation: Rotation Only!
        const attackPhase = Math.sin(time * 20); 
        
        // Swing Arm
        model.rightArm.rotation.x = -2.0 + (attackPhase + 1) * 1.5; 
        model.rightArm.rotation.z = 0;

        // Balance Left Arm
        model.leftArm.rotation.x = 0.5; 
        model.leftArm.rotation.z = -0.5;

        // Twist Torso
        model.torso.rotation.y = Math.sin(time * 20) * 0.5;
        
        // Reset torso offsets to prevent splitting
        model.torso.position.set(0, 0.7, 0); 
    }

    private static animateIdleOrWalk(model: HumanoidRig, speed: number, time: number) {
        if (speed > 0.1) {
            // Running
            const armFreq = 12;
            const armAmp = 0.6;
            
            model.leftArm.rotation.x = Math.sin(time * armFreq + Math.PI) * armAmp;
            model.rightArm.rotation.x = Math.sin(time * armFreq) * armAmp;
            model.leftArm.rotation.z = 0.1;
            model.rightArm.rotation.z = -0.1;
            
            // Lean forward
            model.torso.rotation.x = 0.1;
            model.torso.rotation.y = Math.sin(time * 6) * 0.1;
        } else {
            // Idle
            const breath = Math.sin(time * 2.0);
            
            model.leftArm.rotation.x = breath * 0.05;
            model.rightArm.rotation.x = -breath * 0.05;
            model.leftArm.rotation.z = 0.1;
            model.rightArm.rotation.z = -0.1;

            model.torso.rotation.x = 0;
            model.torso.rotation.y = 0;
        }
        
        // CRITICAL FIX: Ensure Torso Y matches HeroModel pivot (0.7)
        // Instead of bobbing position (which detaches legs), we scale breathing or ignore bob.
        // Or bob the whole mesh via PlayerEntity physics. Here we keep local transforms rigid.
        model.torso.position.set(0, 0.7, 0);
    }
}
