
/**
 * TITAN ENGINE: COOLDOWN SHADER
 * High-performance GLSL radial wipe for skill buttons.
 */

import Phaser from 'phaser';

const FragShader = `
#define PI 3.14159265359

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uProgress; // 0.0 (Full Cooldown) to 1.0 (Ready)
uniform float uTime;

varying vec2 outTexCoord;

void main() {
    vec4 texColor = texture2D(uMainSampler, outTexCoord);
    
    // Center UV at 0.5, 0.5
    vec2 uv = outTexCoord - 0.5;
    
    // Calculate Angle (0 at top, clockwise)
    // atan(y, x) returns -PI to PI
    // We want 0 at top (0, -1 in UV space is up in texture?) 
    // Typically UV (0,0) is top-left. So (0.5, 0) is top center.
    // -y is up.
    float angle = atan(-uv.x, uv.y) + PI; // 0 to 2PI
    float normalizedAngle = angle / (2.0 * PI);
    
    // Invert progress because typically we show the dark part shrinking
    // Let's say uProgress 0 = Full Dark, 1 = Full Bright
    // We draw dark overlay if normalizedAngle > uProgress
    
    float mask = step(normalizedAngle, uProgress);
    
    vec3 finalColor = texColor.rgb;
    
    // Apply grayscale + darken to cooldown area
    if (mask < 0.5) {
        float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
        finalColor = vec3(gray * 0.4); // Darkened gray
    }
    
    // Flash effect when uProgress just hit 1.0 (handled by JS uniform tween ideally, but simple bloom here)
    if (uProgress >= 0.98) {
        float flash = sin(uTime * 10.0) * 0.5 + 0.5; // Pulse ready
        // No shader-side pulse for ready state usually, handled by separate tween.
    }

    gl_FragColor = vec4(finalColor, texColor.a);
}
`;

export class CooldownPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
    constructor(game: Phaser.Game) {
        super({
            game,
            fragShader: FragShader,
            uniforms: [
                'uProjectionMatrix',
                'uMainSampler',
                'uProgress',
                'uTime'
            ]
        });
    }
}
