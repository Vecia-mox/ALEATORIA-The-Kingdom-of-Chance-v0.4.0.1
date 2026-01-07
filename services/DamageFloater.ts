import { Scene, GameObjects } from 'phaser';

export class DamageFloater {
  private scene: Scene;
  private pool: GameObjects.Text[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public showDamage(x: number, y: number, amount: number | string, isCrit: boolean, isPlayerDamage: boolean = false) {
    let text = this.pool.find(t => !t.active);
    
    if (!text) {
      text = this.scene.add.text(0, 0, '', {
        fontFamily: 'Cinzel, serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }).setDepth(3000).setOrigin(0.5);
      this.pool.push(text);
    }

    text.setActive(true).setVisible(true);
    text.setPosition(x, y);
    text.setText(amount.toString());
    text.setAlpha(1);
    text.setScale(1);
    text.setRotation(0);

    if (isPlayerDamage) {
        text.setColor('#ef4444'); // Red
        text.setFontSize(24);
    } else if (isCrit) {
      text.setFontSize(32);
      text.setColor('#fbbf24'); // Gold
      text.setStroke('#78350f', 6);
      
      // Pop effect
      this.scene.tweens.add({
        targets: text,
        scale: { from: 2.0, to: 1.0 },
        duration: 200,
        ease: 'Back.out'
      });
    } else {
      text.setFontSize(20);
      text.setColor('#ffffff');
      text.setStroke('#000000', 4);
    }

    // Physics curve: Up fast, then slow down (simulating gravity)
    this.scene.tweens.add({
      targets: text,
      y: y - (isCrit ? 100 : 60),
      alpha: 0,
      duration: isCrit ? 1500 : 1000,
      ease: 'Power2',
      onComplete: () => {
        text?.setActive(false).setVisible(false);
      }
    });
    
    // Horizontal drift
    const drift = Math.random() * 60 - 30;
    this.scene.tweens.add({
        targets: text,
        x: x + drift,
        duration: 1000,
        ease: 'Linear'
    });
  }
}