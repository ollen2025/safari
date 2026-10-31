import Phaser from 'phaser';
import { ANIMALS, type AnimalKey } from './animals';

const CANVAS_SIZE = 256;
const DRAWING_SIZE = 160; // tegningerne nedenfor er lavet på et 160x160 lærred
const EMOJI_FONT = '170px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

type Ctx = CanvasRenderingContext2D;

function ellipse(ctx: Ctx, color: string, x: number, y: number, rx: number, ry: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Dyr uden emoji. De vender mod venstre ligesom emojierne.
const DRAWINGS: Partial<Record<AnimalKey, (ctx: Ctx) => void>> = {
  ostrich: (ctx) => {
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#e3a98f';
    ctx.lineWidth = 6;
    line(ctx, 82, 100, 70, 156);
    line(ctx, 92, 100, 96, 156);
    // Sort krop med hvide vinge- og halefjer
    ellipse(ctx, '#1c1c1c', 88, 85, 42, 28);
    ellipse(ctx, '#f5f5f5', 128, 76, 15, 11);
    ellipse(ctx, '#f5f5f5', 104, 92, 14, 7);
    // Lang hals og lille hoved
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(60, 75);
    ctx.quadraticCurveTo(38, 50, 46, 22);
    ctx.stroke();
    ellipse(ctx, '#e3a98f', 42, 18, 11, 9);
    ctx.fillStyle = '#d98c5f';
    ctx.beginPath();
    ctx.moveTo(34, 14);
    ctx.lineTo(22, 21);
    ctx.lineTo(34, 24);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, '#000', 42, 15, 2.5, 2.5);
  },

  hyena: (ctx) => {
    // Forbenene er længere end bagbenene, så ryggen skråner
    ctx.fillStyle = '#a07a45';
    ctx.fillRect(52, 92, 9, 60);
    ctx.fillRect(66, 92, 9, 60);
    ctx.fillRect(106, 104, 9, 48);
    ctx.fillRect(119, 104, 9, 48);
    ctx.strokeStyle = '#3b2a17';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    line(ctx, 130, 98, 142, 120);
    // Skrå krop med pletter
    ctx.save();
    ctx.translate(88, 96);
    ctx.rotate(0.2);
    ellipse(ctx, '#c9a26b', 0, 0, 46, 24);
    ctx.restore();
    for (const [x, y] of [[70, 88], [88, 92], [104, 100], [80, 104], [98, 84], [116, 106]]) {
      ellipse(ctx, '#5a4024', x, y, 4, 4);
    }
    // Runde ører, hoved og mørk snude
    ellipse(ctx, '#a07a45', 46, 50, 7, 8);
    ellipse(ctx, '#a07a45', 58, 54, 7, 8);
    ellipse(ctx, '#c9a26b', 44, 68, 19, 17);
    ellipse(ctx, '#6b5030', 27, 76, 13, 9);
    ellipse(ctx, '#000', 16, 74, 4, 3.5);
    ellipse(ctx, '#000', 40, 64, 2.5, 2.5);
  },
};

// Skærer den gennemsigtige kant væk, så billedets bund er dyrets fødder
function trim(source: HTMLCanvasElement): HTMLCanvasElement {
  const { width, height } = source;
  const pixels = source.getContext('2d')!.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] < 10) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < 0) return source;

  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext('2d')!.drawImage(source, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

// Laver (én gang) en tekstur for dyret, enten fra emoji eller tegning
export function animalTexture(scene: Phaser.Scene, key: AnimalKey): string {
  const textureKey = `animal-${key}`;
  if (scene.textures.exists(textureKey)) return textureKey;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d')!;
  const draw = DRAWINGS[key];
  if (draw) {
    ctx.scale(CANVAS_SIZE / DRAWING_SIZE, CANVAS_SIZE / DRAWING_SIZE);
    draw(ctx);
  } else {
    ctx.font = EMOJI_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ANIMALS[key].emoji ?? '?', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);
  }
  scene.textures.addCanvas(textureKey, trim(canvas));
  return textureKey;
}

// Tilføjer et dyr med fødderne i (x, y). `size` er dyrets længste side i pixels.
export function addAnimalImage(scene: Phaser.Scene, key: AnimalKey, x: number, y: number, size: number) {
  const image = scene.add.image(x, y, animalTexture(scene, key)).setOrigin(0.5, 1);
  return image.setScale(size / Math.max(image.width, image.height));
}
