import Phaser from 'phaser';
import { speak } from './sound';

const SKIN = 0x8d5524;
const BEARD = 0x2b1b10;
const HAT = 0xc8b07a;
const HAT_BAND = 0x6b4f2a;
const SHIRT = 0x6b7d3a;

function drawAbdul(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  // Krop
  g.fillStyle(SHIRT).fillRoundedRect(-85, 50, 170, 120, 40);
  // Ansigt med skæg
  g.fillStyle(SKIN).fillCircle(0, 0, 60);
  g.fillStyle(BEARD).slice(0, 5, 62, 0, Math.PI, false).fillPath();
  g.fillStyle(SKIN).fillEllipse(0, 22, 56, 26);
  g.lineStyle(5, 0x5a1e0e).beginPath().arc(0, 18, 16, 0.15 * Math.PI, 0.85 * Math.PI).strokePath();
  // Øjne
  g.fillStyle(0xffffff).fillCircle(-22, -8, 11).fillCircle(22, -8, 11);
  g.fillStyle(0x000000).fillCircle(-20, -6, 6).fillCircle(20, -6, 6);
  // Safarihat
  g.fillStyle(HAT).fillEllipse(0, -42, 180, 34);
  g.fillStyle(HAT).fillRoundedRect(-52, -100, 104, 62, 18);
  g.fillStyle(HAT_BAND).fillRect(-52, -56, 104, 12);
  return g;
}

// Abdul er chaufføren. Han taler med browserens oplæser og viser en taleboble.
export class Abdul {
  private readonly figure: Phaser.GameObjects.Container;
  private readonly bubble: Phaser.GameObjects.Container;
  private readonly bubbleBg: Phaser.GameObjects.Graphics;
  private readonly bubbleText: Phaser.GameObjects.Text;
  private readonly baseY: number;
  private hideTimer?: Phaser.Time.TimerEvent;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number, scale = 1) {
    this.baseY = y;
    this.figure = scene.add.container(x, y, [drawAbdul(scene)]).setScale(scale).setDepth(20);
    this.bubbleBg = scene.add.graphics();
    this.bubbleText = scene.add
      .text(0, 0, '', { fontFamily: 'sans-serif', fontSize: '28px', color: '#222', align: 'center', wordWrap: { width: 420 } })
      .setOrigin(0.5);
    this.bubble = scene.add.container(0, 0, [this.bubbleBg, this.bubbleText]).setDepth(100).setVisible(false);
  }

  destroy() {
    this.hideTimer?.remove();
    this.figure.destroy();
    this.bubble.destroy();
  }

  say(text: string) {
    speak(text);

    this.bubbleText.setText(text);
    const w = this.bubbleText.width + 40;
    const h = this.bubbleText.height + 28;
    this.bubbleBg
      .clear()
      .fillStyle(0xffffff, 0.95)
      .fillRoundedRect(-w / 2, -h / 2, w, h, 20)
      .fillTriangle(-w / 2 + 30, h / 2 - 2, -w / 2 + 70, h / 2 - 2, -w / 2 + 25, h / 2 + 24);
    const headTop = this.figure.y - 110 * this.figure.scale;
    const x = Phaser.Math.Clamp(this.figure.x + w / 2 - 40, w / 2 + 10, 1270 - w / 2);
    this.bubble.setPosition(x, headTop - h / 2 - 28).setVisible(true);

    this.scene.tweens.add({
      targets: this.figure,
      y: { from: this.baseY, to: this.baseY - 10 },
      duration: 120,
      yoyo: true,
      repeat: 2,
    });

    this.hideTimer?.remove();
    this.hideTimer = this.scene.time.delayedCall(Math.max(2500, text.length * 80), () => this.bubble.setVisible(false));
  }
}
