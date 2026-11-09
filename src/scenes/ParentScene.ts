import Phaser from 'phaser';
import { Abdul } from '../abdul';
import { addAnimalImage } from '../animalArt';
import { ANIMAL_COUNTED, ANIMALS, animalsIn, currentWorld, type AnimalKey } from '../animals';
import { line, LINES } from '../lines';
import { ANY_ANIMAL, loadParentState, saveParentState, type GoalAnimal, type ParentLimit, type ParentState } from '../parentLimit';
import { makeButton } from '../ui';

const BUTTON = { x: 1148, y: 40, radius: 26 }; // med vilje lille: det er forældrenes knap, ikke barnets
const LOCK_DELAY_MS = 3500; // så barnet når at se og høre det sidste dyr blive talt
const TIME_CHOICES = [5, 10, 15, 20, 30]; // minutter
const DEFAULT_GOAL = 3;
const MAX_GOAL = 20;
const ANIMALS_PER_ROW = 7;
const FONT = { fontFamily: 'sans-serif', fontStyle: 'bold', color: '#fff' };

interface MathProblem {
  question: Phaser.GameObjects.Text;
  display: Phaser.GameObjects.Text;
  answer: string;
  typed: string;
  onSolved: () => void;
}

function formatTime(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function describeGoal(animal: GoalAnimal, target: number) {
  if (animal === ANY_ANIMAL) return `${target} dyr`;
  return target === 1 ? ANIMALS[animal].name : `${target} ${ANIMALS[animal].plural}`;
}

// Forældre-timer: et lag oven på alle andre scener, så en aftale kan laves midt i en tur.
// Spillet fryser, mens laget er åbent, og fortsætter bagefter præcis hvor det slap.
export class ParentScene extends Phaser.Scene {
  private state: ParentState = { locked: false };
  private button!: Phaser.GameObjects.Container;
  private status!: Phaser.GameObjects.Text;
  private screen?: Phaser.GameObjects.Container;
  private abdul?: Abdul;
  private math?: MathProblem;
  private readonly pausedScenes = new Set<string>();

  constructor() {
    super('Parent');
  }

  create() {
    this.state = loadParentState();
    this.button = makeButton(this, BUTTON.x, BUTTON.y, '⏱️', 0xffffff, () => this.openGate(), BUTTON.radius);
    this.status = this.add
      .text(BUTTON.x, BUTTON.y + BUTTON.radius + 16, '', {
        ...FONT,
        fontSize: '20px',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.game.events.on(ANIMAL_COUNTED, (key: AnimalKey) => this.onAnimalCounted(key));
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => this.onKey(event));
    if (this.state.locked) this.lock();
  }

  update() {
    // Også i update, fordi en scene kan nå at starte, efter laget er åbnet
    if (this.screen) this.pauseGame();

    const { limit, locked } = this.state;
    if (limit?.kind === 'time' && !locked && Date.now() >= limit.endsAt) this.lock();
    this.refreshStatus();
  }

  private refreshStatus() {
    const { limit } = this.state;
    let text = '';
    if (limit?.kind === 'time') text = formatTime(limit.endsAt - Date.now());
    if (limit?.kind === 'goal') text = `${limit.found}/${limit.target}`;
    if (this.status.text !== text) this.status.setText(text);
  }

  private onAnimalCounted(key: AnimalKey) {
    const { limit, locked } = this.state;
    if (limit?.kind !== 'goal' || locked) return;
    if (limit.animal !== ANY_ANIMAL && limit.animal !== key) return;
    limit.found++;
    if (limit.found >= limit.target) {
      // Låsen gemmes med det samme, så forsinkelsen ikke kan bruges til at slippe uden om den
      this.state.locked = true;
      this.time.delayedCall(LOCK_DELAY_MS, () => this.lock());
    }
    saveParentState(this.state);
  }

  private setLimit(limit?: ParentLimit) {
    this.state = { locked: false, limit };
    saveParentState(this.state);
    this.refreshStatus();
    this.closeScreen();
  }

  private lock() {
    this.state = { locked: true };
    saveParentState(this.state);
    const screen = this.newScreen();
    screen.add(this.add.text(320, 110, '🌙 Turen er slut', { ...FONT, fontSize: '56px' }).setOrigin(0.5));
    screen.add(this.add.text(320, 185, 'Hent en voksen', { ...FONT, fontSize: '36px', color: '#ffd23f' }).setOrigin(0.5));
    this.abdul = new Abdul(this, 200, 540);
    this.abdul.say(line(LINES.parentStop));
    this.addMath(screen, () => {
      this.state = { locked: false };
      saveParentState(this.state);
      this.showSettings();
    });
  }

  private openGate() {
    if (this.state.locked || this.screen) return;
    // Regnestykket skal kun beskytte en aftale, der allerede er lavet
    if (!this.state.limit) {
      this.showSettings();
      return;
    }
    const screen = this.newScreen();
    screen.add(this.add.text(320, 300, '⏱️', { fontSize: '120px', padding: { x: 10, y: 10 } }).setOrigin(0.5));
    screen.add(this.add.text(320, 420, 'Kun for voksne', { ...FONT, fontSize: '48px' }).setOrigin(0.5));
    this.addCloseButton(screen, 1210, 70);
    this.addMath(screen, () => this.showSettings());
  }

  private addMath(screen: Phaser.GameObjects.Container, onSolved: () => void) {
    const question = this.add.text(880, 90, '', { ...FONT, fontSize: '64px' }).setOrigin(0.5);
    const display = this.add.text(880, 180, '', { ...FONT, fontSize: '64px', color: '#ffd23f' }).setOrigin(0.5);
    screen.add([question, display]);
    this.math = { question, display, answer: '', typed: '', onSolved };
    this.newProblem();

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0'];
    keys.forEach((key, i) => {
      const x = 780 + (i % 3) * 100;
      const y = 285 + Math.floor(i / 3) * 100;
      screen.add(this.textButton(x, y, 90, 90, key, 0x457b9d, () => this.pressKey(key)));
    });
  }

  // Facit er altid mellem 10 og 20: let for en voksen, men for svært for et barn på 4
  private newProblem() {
    const math = this.math;
    if (!math) return;
    const a = Phaser.Math.Between(5, 10);
    const b = Phaser.Math.Between(5, 10);
    math.answer = String(a + b);
    math.typed = '';
    math.question.setText(`${a} + ${b} =`);
    this.refreshDisplay();
  }

  private refreshDisplay() {
    const math = this.math;
    if (math) math.display.setText(math.typed.padEnd(math.answer.length, '_').split('').join(' '));
  }

  private pressKey(key: string) {
    const math = this.math;
    if (!math) return;
    if (key === '⌫') {
      math.typed = math.typed.slice(0, -1);
      this.refreshDisplay();
      return;
    }
    math.typed += key;
    this.refreshDisplay();
    if (math.typed.length < math.answer.length) return;
    if (math.typed === math.answer) {
      math.onSolved();
      return;
    }
    this.tweens.add({ targets: math.display, x: { from: 880, to: 895 }, duration: 60, yoyo: true, repeat: 3 });
    this.newProblem();
  }

  private onKey(event: KeyboardEvent) {
    if (!this.screen) return;
    if (event.key === 'Escape' && !this.state.locked) this.closeScreen();
    else if (/^[0-9]$/.test(event.key)) this.pressKey(event.key);
    else if (event.key === 'Backspace') this.pressKey('⌫');
  }

  private showSettings() {
    const screen = this.newScreen();
    screen.add(this.add.rectangle(640, 360, 1100, 680, 0x264653).setStrokeStyle(4, 0xffffff, 0.5));
    screen.add(this.add.text(640, 65, '⏱️ Forælder-timer', { ...FONT, fontSize: '40px', padding: { y: 6 } }).setOrigin(0.5));
    this.addCloseButton(screen, 1140, 65);
    screen.add(this.add.text(640, 120, this.describeLimit(), { ...FONT, fontSize: '26px', color: '#ffd23f' }).setOrigin(0.5));

    this.addHeading(screen, 165, 'Stop om:');
    TIME_CHOICES.forEach((minutes, i) => {
      const x = 640 + (i - (TIME_CHOICES.length - 1) / 2) * 190;
      screen.add(
        this.textButton(x, 220, 170, 70, `${minutes} min`, 0x2a9d8f, () =>
          this.setLimit({ kind: 'time', endsAt: Date.now() + minutes * 60_000 }),
        ),
      );
    });

    this.addHeading(screen, 280, 'Eller stop når barnet har fundet:');
    this.addGoalPicker(screen);

    if (this.state.limit) {
      screen.add(this.textButton(640, 650, 340, 60, 'Fjern grænsen', 0x6c757d, () => this.setLimit(undefined)));
    }
  }

  private describeLimit() {
    const { limit } = this.state;
    if (limit?.kind === 'time') return `Stopper om ${formatTime(limit.endsAt - Date.now())}`;
    if (limit?.kind === 'goal') {
      return `Stopper efter ${describeGoal(limit.animal, limit.target)} (${limit.found} fundet)`;
    }
    return 'Ingen grænse lige nu';
  }

  private addHeading(screen: Phaser.GameObjects.Container, y: number, text: string) {
    screen.add(this.add.text(120, y, text, { ...FONT, fontSize: '26px' }).setOrigin(0, 0.5));
  }

  private addGoalPicker(screen: Phaser.GameObjects.Container) {
    let chosen: GoalAnimal = ANY_ANIMAL;
    let target = DEFAULT_GOAL;

    const options: GoalAnimal[] = [ANY_ANIMAL, ...animalsIn(currentWorld(this))];
    const tiles = options.map((animal, i) => {
      const x = 640 + ((i % ANIMALS_PER_ROW) - (ANIMALS_PER_ROW - 1) / 2) * 140;
      const y = 345 + Math.floor(i / ANIMALS_PER_ROW) * 90;
      const tile = this.add.rectangle(x, y, 125, 80, 0xfff8e7).setInteractive({ useHandCursor: true });
      const icon =
        animal === ANY_ANIMAL
          ? this.add.text(x, y, '🐾', { fontSize: '44px', padding: { x: 6, y: 6 } }).setOrigin(0.5)
          : addAnimalImage(this, animal, x, y + 34, 66, 1);
      screen.add([tile, icon]);
      tile.on('pointerdown', () => {
        chosen = animal;
        markChosen();
      });
      return { tile, animal };
    });
    const markChosen = () => {
      for (const { tile, animal } of tiles) tile.setStrokeStyle(6, animal === chosen ? 0xffd23f : 0xfff8e7);
    };
    markChosen();

    const y = 575;
    const count = this.add.text(420, y, String(target), { ...FONT, fontSize: '44px' }).setOrigin(0.5);
    const change = (by: number) => {
      target = Phaser.Math.Clamp(target + by, 1, MAX_GOAL);
      count.setText(String(target));
    };
    screen.add([
      this.add.text(120, y, 'Antal:', { ...FONT, fontSize: '26px' }).setOrigin(0, 0.5),
      this.textButton(320, y, 80, 70, '−', 0x457b9d, () => change(-1)),
      count,
      this.textButton(520, y, 80, 70, '+', 0x457b9d, () => change(1)),
      this.textButton(860, y, 460, 70, 'Stop ved dette antal', 0x2a9d8f, () =>
        this.setLimit({ kind: 'goal', animal: chosen, target, found: 0 }),
      ),
    ]);
  }

  private addCloseButton(screen: Phaser.GameObjects.Container, x: number, y: number) {
    screen.add(this.textButton(x, y, 70, 70, '✕', 0xd62828, () => this.closeScreen()));
  }

  private textButton(x: number, y: number, w: number, h: number, label: string, color: number, onTap: () => void) {
    const bg = this.add.rectangle(0, 0, w, h, color).setStrokeStyle(3, 0xffffff, 0.6);
    const text = this.add.text(0, 0, label, { ...FONT, fontSize: '32px' }).setOrigin(0.5);
    const button = this.add.container(x, y, [bg, text]).setSize(w, h);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', onTap);
    return button;
  }

  private newScreen() {
    this.clearScreen();
    this.button.setVisible(false);
    this.status.setVisible(false);
    // Under Abduls depth, så han står foran det mørke lag
    this.screen = this.add.container(0, 0, [this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8)]).setDepth(10);
    this.pauseGame();
    return this.screen;
  }

  private clearScreen() {
    this.screen?.destroy();
    this.screen = undefined;
    this.abdul?.destroy();
    this.abdul = undefined;
    this.math = undefined;
  }

  private closeScreen() {
    this.clearScreen();
    this.button.setVisible(true);
    this.status.setVisible(true);
    for (const key of this.pausedScenes) {
      if (this.scene.isPaused(key)) this.scene.resume(key);
    }
    this.pausedScenes.clear();
  }

  private pauseGame() {
    for (const scene of this.game.scene.getScenes(true)) {
      const key = scene.scene.key;
      // Phaser udfører først pausen senere i samme frame, så scenen kan stadig se aktiv ud
      if (scene === this || this.pausedScenes.has(key)) continue;
      this.scene.pause(key);
      this.pausedScenes.add(key);
    }
  }
}
