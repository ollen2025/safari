import Phaser from 'phaser';
import { addAnimalImage } from './animalArt';
import { ANIMAL_KEYS, getCounts, type AnimalKey } from './animals';

// Stor rund knap med en emoji. Hele firkanten omkring er trykbar, så små fingre rammer.
export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  emoji: string,
  color: number,
  onTap: () => void,
  radius = 80,
): Phaser.GameObjects.Container {
  const bg = scene.add.graphics();
  bg.fillStyle(0x000000, 0.25).fillCircle(4, 6, radius);
  bg.fillStyle(color).fillCircle(0, 0, radius);
  bg.lineStyle(6, 0xffffff, 0.8).strokeCircle(0, 0, radius - 3);
  const icon = scene.add.text(0, 0, emoji, { fontSize: `${radius}px`, padding: { x: 6, y: 6 } }).setOrigin(0.5);

  const button = scene.add.container(x, y, [bg, icon]).setSize(radius * 2, radius * 2).setDepth(20);
  button.setInteractive({ useHandCursor: true });
  button.on('pointerdown', () => {
    scene.tweens.add({ targets: button, scale: { from: 1, to: 0.88 }, duration: 80, yoyo: true });
    onTap();
  });
  return button;
}

// Stort gult tal med sort kant, til at øve tal ("3 zebraer", "3 kugler")
export function makeBigNumber(scene: Phaser.Scene, x: number, y: number, value: number, fontSize: number) {
  return scene.add
    .text(x, y, String(value), {
      fontFamily: 'sans-serif',
      fontSize: `${fontSize}px`,
      fontStyle: 'bold',
      color: '#ffd23f',
      stroke: '#000',
      strokeThickness: fontSize / 12,
    })
    .setOrigin(0.5);
}

// Lader noget poppe frem fra lille til fuld størrelse
export function popIn(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject) {
  scene.tweens.add({ targets: target, scale: { from: 0.3, to: 1 }, duration: 400, ease: 'Back.easeOut' });
}

interface Slot {
  icon: Phaser.GameObjects.Image;
  iconScale: number;
  badge: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  shown: number;
}

// Række med alle dyrene øverst på skærmen og hvor mange man har fundet af hver.
// Ikke-fundne dyr vises som grå silhuetter.
export class CollectionBar {
  private readonly slots = new Map<AnimalKey, Slot>();

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    const spacing = 70;
    const width = ANIMAL_KEYS.length * spacing + 20;
    const startX = x - ((ANIMAL_KEYS.length - 1) * spacing) / 2;

    const bg = scene.add.graphics().fillStyle(0x000000, 0.35).fillRoundedRect(x - width / 2, y - 34, width, 68, 34);
    const container = scene.add.container(0, 0, [bg]).setDepth(20);
    ANIMAL_KEYS.forEach((key, i) => {
      const slotX = startX + i * spacing;
      const icon = addAnimalImage(scene, key, slotX, y + 24, 50);
      const label = scene.add
        .text(0, 0, '', { fontFamily: 'sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#222' })
        .setOrigin(0.5);
      const badge = scene.add.container(slotX + 22, y + 20, [scene.add.circle(0, 0, 14, 0xffd23f), label]);
      container.add([icon, badge]);
      this.slots.set(key, { icon, iconScale: icon.scale, badge, label, shown: 0 });
    });
    this.refresh(false);

    const onChange = () => this.refresh(true);
    scene.registry.events.on('changedata-counts', onChange);
    scene.events.once('shutdown', () => scene.registry.events.off('changedata-counts', onChange));
  }

  private refresh(animate: boolean) {
    const counts = getCounts(this.scene);
    for (const [key, slot] of this.slots) {
      const count = counts[key] ?? 0;
      slot.badge.setVisible(count > 0);
      slot.label.setText(String(count));
      if (count === 0) {
        slot.icon.setTintFill(0x222222).setAlpha(0.45);
      } else {
        slot.icon.clearTint().setAlpha(1);
      }

      if (animate && count !== slot.shown) {
        this.scene.tweens.add({ targets: slot.badge, scale: { from: 2, to: 1 }, duration: 500, ease: 'Back.easeOut' });
        if (slot.shown === 0) {
          this.scene.tweens.add({
            targets: slot.icon,
            scale: { from: slot.iconScale * 2, to: slot.iconScale },
            duration: 500,
            ease: 'Back.easeOut',
          });
        }
      }
      slot.shown = count;
    }
  }
}
