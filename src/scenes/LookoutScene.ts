import Phaser from 'phaser';
import { addAnimalImage, BABY_SCALE, variedSize } from '../animalArt';
import { ANIMALS, currentWorld, poseOf, randomAnimal, type AnimalKey, type WorldKey } from '../animals';
import { LANDSCAPES, type Landscape } from '../landscapes';
import { BRANCH, drawHill } from '../scenery';
import { playAnimalSound } from '../sound';

const WORLD_WIDTH = 3840;
const HORIZON = 340;
const SPYGLASS_ZOOM = 3;
const PAN_SPEED = 700;
const WATERHOLE_Y = 545;

// Hvor langt væk et dyr står. Dyr langt væk er så små, at man skal bruge kikkerten.
// hitSize er det mindste trykbare område i verdens-pixels, så små fingre kan ramme:
// 120 px for dyr, man ser uden kikkert, og 50 px for dyr langt væk (= 150 px på skærmen med kikkerten).
const DISTANCES = {
  near: { y: 650, size: 150, hitSize: 120 },
  mid: { y: 480, size: 70, hitSize: 120 },
  far: { y: 385, size: 24, hitSize: 50 },
};
const HERD_SPACING = 55; // større end hitSize for "far", så trykområderne i en flok ikke overlapper
const TAP_TOLERANCE = 30; // så meget må fingeren flytte sig, før det tæller som et træk
const KEY_LABELS = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // tasterne man kan markere dyr med
type Distance = keyof typeof DISTANCES;

interface KeyedAnimal {
  sprite: Phaser.GameObjects.Image;
  mark: () => void;
}

// Spilleren står op i jeepen og kigger ud over landskabet.
// Knapperne ligger i LookoutUIScene, så de ikke zoomer med, når kikkerten bruges.
export class LookoutScene extends Phaser.Scene {
  panDirection = 0;
  private seen: AnimalKey[] = [];
  private keyedAnimals = new Map<string, KeyedAnimal>();
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private world: WorldKey = 'safari';
  private landscape!: Landscape;

  constructor() {
    super('Lookout');
  }

  // Phaser genbruger scene-objektet, så tilstand skal nulstilles her og ikke i felterne
  init(data: { seen?: AnimalKey[] }) {
    this.seen = data.seen ?? [];
    this.panDirection = 0;
    this.keyedAnimals = new Map();
    this.world = currentWorld(this);
    this.landscape = LANDSCAPES[this.world];
  }

  create() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_WIDTH, 720);
    cam.setZoom(1);
    cam.centerOn(WORLD_WIDTH / 2, 360);

    this.buildLandscape();
    this.placeAnimals();

    // Træk med fingeren for at kigge rundt. Vi husker selv sidste position, fordi Phasers
    // prevPosition kan stamme fra en tidligere berøring på touch. Første bevægelse efter et
    // nyt tryk (ny downTime) sætter kun startpunktet, også hvis trykket begyndte på en knap i UI-scenen.
    const last = { x: 0, y: 0 };
    let dragDownTime = -1;
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      if (p.downTime !== dragDownTime) {
        dragDownTime = p.downTime;
        last.x = p.x;
        last.y = p.y;
        return;
      }
      cam.scrollX -= (p.x - last.x) / cam.zoom;
      cam.scrollY -= (p.y - last.y) / cam.zoom;
      last.x = p.x;
      last.y = p.y;
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    // Tryk på tallet eller bogstavet ved et dyr for at markere det. Kun dyr i billedet tæller,
    // så man stadig skal kigge efter dem.
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.repeat) return;
      const animal = this.keyedAnimals.get(event.key.toUpperCase());
      if (animal && Phaser.Geom.Intersects.RectangleToRectangle(animal.sprite.getBounds(), cam.worldView)) {
        animal.mark();
      }
    });

    this.scene.launch('LookoutUI');
  }

  update(_time: number, delta: number) {
    // Stop drejningen, hvis ingen finger er nede, fx hvis systemet afbrød berøringen
    if (!this.input.manager.pointers.some((p) => p.isDown)) this.panDirection = 0;

    const keys = this.cursors;
    const dx = Math.sign(this.panDirection + Number(keys?.right.isDown) - Number(keys?.left.isDown));
    const dy = Number(keys?.down.isDown) - Number(keys?.up.isDown);
    if (dx === 0 && dy === 0) return;
    const cam = this.cameras.main;
    const step = (PAN_SPEED * (delta / 1000)) / cam.zoom;
    cam.scrollX += dx * step;
    cam.scrollY += dy * step;
  }

  setSpyglass(on: boolean) {
    const cam = this.cameras.main;
    cam.zoomTo(on ? SPYGLASS_ZOOM : 1, 400, 'Sine.easeInOut');
    if (on) cam.pan(cam.midPoint.x, HORIZON + 30, 400, 'Sine.easeInOut');
  }

  private buildLandscape() {
    const { Between, FloatBetween } = Phaser.Math;
    const land = this.landscape;

    this.add.rectangle(WORLD_WIDTH / 2, HORIZON / 2, WORLD_WIDTH, HORIZON, land.sky).setDepth(-10);
    if (land.sun) this.add.circle(WORLD_WIDTH / 2 + 450, 130, 55, 0xffd23f).setDepth(-10);
    for (let x = 0; x < WORLD_WIDTH + 400; x += Between(350, 550)) {
      drawHill(this, x, HORIZON + 10, Between(500, 800), Between(100, 180), land.lookoutHill).setDepth(-9);
    }
    this.add.rectangle(WORLD_WIDTH / 2, (HORIZON + 720) / 2, WORLD_WIDTH, 720 - HORIZON, land.ground).setDepth(-8);
    // Lysere, diset bånd langt væk
    this.add.rectangle(WORLD_WIDTH / 2, HORIZON + 30, WORLD_WIDTH, 60, land.haze).setDepth(-7);

    // Alt i landskabet får depth = y, så det der står tættest på tegnes forrest
    for (let i = 0; i < land.lookoutTrees; i++) {
      const far = Math.random() < 0.5;
      const y = far ? HORIZON + 45 : Between(450, 520);
      land.tree(this, Between(0, WORLD_WIDTH), y, far ? 0.25 : FloatBetween(0.5, 0.7)).setDepth(y);
    }
    for (let x = 100; x < WORLD_WIDTH; x += Between(400, 700)) {
      land.bush(this, x, 700, FloatBetween(1, 1.4)).setDepth(700);
    }
  }

  private placeAnimals() {
    const center = WORLD_WIDTH / 2;
    const { Between } = Phaser.Math;

    // De dyr, der var i vinduet da bilen stoppede, står tæt på
    this.seen.forEach((key, i) => {
      const x = center + (i - (this.seen.length - 1) / 2) * 380;
      this.addAnimal(key, x, i === 0 ? 'near' : 'mid');
    });
    // Der skal altid være noget at se, når man rejser sig
    if (this.seen.length === 0) this.addAnimal(randomAnimal(this.world), center + Between(-300, 300), 'mid');

    // Vandhullet ligger lidt ude til siden, så man skal kigge rundt for at finde det
    const waterholeX = center + (Math.random() < 0.5 ? -1 : 1) * 700;
    this.placeWaterhole(waterholeX);

    // Flere dyr rundt omkring, de fleste langt væk
    const slots = Phaser.Utils.Array.Shuffle(
      Array.from({ length: 12 }, (_, i) => 200 + i * 300).filter(
        (x) => Math.abs(x - center) > 600 && Math.abs(x - waterholeX) > 400,
      ),
    );
    const extras: Distance[] = ['mid', 'far', 'far', 'far'];
    extras.forEach((distance, i) => {
      const key = randomAnimal(this.world);
      const herd = distance === 'far' && poseOf(key) === 'ground' ? Between(1, 3) : 1;
      const x = slots[i] + Between(-40, 40);
      for (let j = 0; j < herd; j++) this.addAnimal(key, x + j * HERD_SPACING, distance, j > 0 && Math.random() < 0.4);
    });
  }

  private placeWaterhole(x: number) {
    const land = this.landscape;
    land.water(this, x, WATERHOLE_Y, 520, 90).setDepth(WATERHOLE_Y - 10);
    // Dyr i vandet, hvor kun hoved og ryg stikker op (flodheste, krokodiller)
    for (const s of land.swimmers) {
      if (Math.random() >= s.chance) continue;
      const jitter = s.chance === 1 ? Phaser.Math.Between(-40, 40) : 0;
      this.addAnimalAt(s.key, x + s.dx + jitter, WATERHOLE_Y + s.dy, s.size, 120, s.waterline);
    }
    // Et dyr drikker ved den anden bred
    this.addAnimalAt(Phaser.Utils.Array.GetRandom(land.drinkers), x + 170, WATERHOLE_Y - 40, 90, 120);
  }

  private addAnimal(key: AnimalKey, x: number, distance: Distance, baby = false) {
    const { y, size, hitSize } = DISTANCES[distance];
    this.addAnimalAt(key, x, y, variedSize(size) * (baby ? BABY_SCALE : 1), hitSize);
  }

  // (x, y) er hvor dyret står. `waterline` er hvor stor en del af dyret der stikker op af vandet.
  private addAnimalAt(key: AnimalKey, x: number, y: number, size: number, hitSize: number, waterline?: number) {
    const pose = poseOf(key);
    const hangs = pose === 'hang';
    // Små dyr (fugle, pingviner, ræve) tegnes mindre. Træet får dyrets normale størrelse.
    const animalSize = size * (ANIMALS[key].scale ?? 1);
    const sprite = addAnimalImage(this, key, x, y, animalSize).setDepth(y).setFlipX(Math.random() < 0.5);

    // Trykområdet er mindst hitSize stort og centreret på dyret. Det angives i billedets egne
    // (uskalerede) koordinater, derfor divideres med skalaen.
    const hitWidth = Math.max(sprite.width, hitSize / sprite.scaleX);
    const hitHeight = Math.max(sprite.height, hitSize / sprite.scaleY);
    sprite.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(
        (sprite.width - hitWidth) / 2,
        (sprite.height - hitHeight) / 2,
        hitWidth,
        hitHeight,
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    let baseY = y;
    if (waterline !== undefined) {
      // Kun den øverste del stikker op af vandet
      sprite.setCrop(0, 0, sprite.width, sprite.height * waterline);
      baseY = y + sprite.height * (1 - waterline) * sprite.scaleY;
      sprite.setY(baseY);
    }
    if (pose === 'hang' || pose === 'perch') {
      // Hænger i eller sidder på grenen af et træ, der står hvor dyret ellers ville stå
      const treeScale = size / 80;
      this.landscape.tree(this, x - BRANCH.x * treeScale, y, treeScale).setDepth(y - 1);
      baseY = y + BRANCH.y * treeScale;
      sprite.setOrigin(0.5, ANIMALS[key].anchorY ?? 1).setY(baseY);
    }

    this.tweens.add({
      targets: sprite,
      scaleY: sprite.scaleY * 1.06,
      duration: Phaser.Math.Between(800, 1200),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const keyLabel = KEY_LABELS[this.keyedAnimals.size];
    const label = keyLabel ? this.addKeyLabel(sprite, keyLabel, hitSize, y) : undefined;

    let found = false;
    const mark = () => {
      playAnimalSound(this, key);
      // Dyr hopper op; dyr der hænger, gynger lidt ned i grenen
      this.tweens.add({
        targets: sprite,
        y: { from: baseY, to: baseY + (hangs ? animalSize * 0.15 : -animalSize * 0.4) },
        duration: 180,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      if (found) return;
      found = true;
      label?.setBackgroundColor('#ffd23f');
      // Stjernen kommer over dyret, eller under det, hvis det hænger
      const bounds = sprite.getBounds();
      const starSize = Math.max(14, animalSize * 0.4);
      this.add
        .text(x, hangs ? bounds.bottom + starSize * 0.6 : bounds.top - starSize * 0.6, '⭐', { fontSize: `${starSize}px` })
        .setOrigin(0.5)
        .setDepth(y);
      this.events.emit('animal-found', key);
    };

    sprite.on('pointerup', (p: Phaser.Input.Pointer) => {
      // Det var et træk for at kigge rundt, ikke et tryk på dyret
      if (Phaser.Math.Distance.Between(p.downX, p.downY, p.upX, p.upY) > TAP_TOLERANCE) return;
      mark();
    });
    if (keyLabel) this.keyedAnimals.set(keyLabel, { sprite, mark });
  }

  // Lille skilt med tasten ved dyrets øverste venstre hjørne. Vises kun, hvor der er et tastatur.
  private addKeyLabel(sprite: Phaser.GameObjects.Image, keyLabel: string, hitSize: number, depth: number) {
    if (!this.sys.game.device.os.desktop) return undefined;
    const fontSize = hitSize / 4;
    const { left, top } = sprite.getBounds();
    return this.add
      .text(left, top, keyLabel, {
        fontFamily: 'sans-serif',
        fontSize: `${fontSize}px`,
        fontStyle: 'bold',
        color: '#222',
        backgroundColor: '#fff',
        padding: { x: fontSize * 0.3, y: fontSize * 0.1 },
        resolution: SPYGLASS_ZOOM, // skarp, også når kikkerten zoomer ind
      })
      .setOrigin(0.5)
      .setDepth(depth + 1);
  }
}
