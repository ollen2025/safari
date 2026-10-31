import Phaser from 'phaser';

interface Animal {
  emoji: string;
  name: string; // dansk navn, læses op
  x: number;
  y: number;
}

const ANIMALS: Animal[] = [
  { emoji: '🐘', name: 'Elefant', x: 220, y: 480 },
  { emoji: '🦒', name: 'Giraf', x: 480, y: 420 },
  { emoji: '🦓', name: 'Zebra', x: 760, y: 500 },
  { emoji: '🦁', name: 'Løve', x: 1040, y: 450 },
  { emoji: '🐒', name: 'Abe', x: 380, y: 620 },
  { emoji: '🦛', name: 'Flodhest', x: 900, y: 630 },
];

export class SafariScene extends Phaser.Scene {
  constructor() {
    super('SafariScene');
  }

  create() {
    this.drawLandscape();

    for (const animal of ANIMALS) {
      this.addAnimal(animal);
    }
  }

  private drawLandscape() {
    const { width, height } = this.scale;

    // Sol
    this.add.circle(1120, 110, 70, 0xffd23f);
    // Savanne
    this.add.rectangle(width / 2, height - 200, width, 400, 0xe9c46a);
    // Et træ
    this.add.rectangle(130, 330, 24, 120, 0x8b5a2b);
    this.add.ellipse(130, 270, 200, 60, 0x4f772d);
  }

  private addAnimal(animal: Animal) {
    const sprite = this.add
      .text(animal.x, animal.y, animal.emoji, { fontSize: '130px', padding: { x: 10, y: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Dyrene "trækker vejret" lidt, så de føles levende
    this.tweens.add({
      targets: sprite,
      scaleY: 1.05,
      duration: 900 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    sprite.on('pointerdown', () => {
      this.say(animal.name);
      this.tweens.add({
        targets: sprite,
        y: animal.y - 80,
        angle: { from: -10, to: 10 },
        duration: 250,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => sprite.setAngle(0),
      });
    });
  }

  // Browserens indbyggede oplæser - ingen lydfiler nødvendige
  private say(text: string) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'da-DK';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
}
