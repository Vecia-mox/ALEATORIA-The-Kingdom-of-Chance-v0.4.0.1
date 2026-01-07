
import Phaser from 'phaser';

const FragShader = `
precision mediump float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main() {
    vec4 color = texture2D(uMainSampler, outTexCoord);
    
    // Gothic Atmosphere: Desaturate slightly + Blue Tint
    // Weights for luma: 0.299, 0.587, 0.114
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grey = vec3(luma);
    
    // Mix original with grey (Desaturation 20%)
    vec3 finalColor = mix(color.rgb, grey, 0.2);
    
    // Apply Cold Tint (R:0.9, G:0.9, B:1.1)
    finalColor *= vec3(0.9, 0.9, 1.1);
    
    // Vignette
    vec2 uv = outTexCoord - 0.5;
    float dist = length(uv);
    float vignette = smoothstep(0.7, 0.4, dist);
    
    gl_FragColor = vec4(finalColor * vignette, color.a);
}
`;

export class GothicPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader: FragShader,
      name: 'GothicPipeline'
    });
  }
}
