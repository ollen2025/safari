import Phaser from 'phaser';
import type { WorldKey } from './animals';

// Verdenerne man kan vælge i startmenuen. Dem uden `play` er pladsholdere, der ikke er bygget endnu.
export interface WorldDef {
  key: string;
  title: string; // vises på kortet (til de voksne; børnene ser tegningen)
  spokenName: string; // bruges i Abduls sætninger: "Vi skal snart til {name}!"
  emoji: string;
  play?: WorldKey; // verdenen man kører rundt i. Mangler den, er verdenen ikke klar endnu.
  paint: (g: Phaser.GameObjects.Graphics, p: Rect) => void;
}

export interface Rect {
  l: number;
  t: number;
  w: number;
  h: number;
}

// Hjælpere til at tegne øverste/nederste del af et kort med runde hjørner
function top(g: Phaser.GameObjects.Graphics, p: Rect, height: number, color: number) {
  g.fillStyle(color).fillRoundedRect(p.l, p.t, p.w, height, { tl: 8, tr: 8, bl: 0, br: 0 });
}
function bottom(g: Phaser.GameObjects.Graphics, p: Rect, height: number, color: number) {
  g.fillStyle(color).fillRoundedRect(p.l, p.t + p.h - height, p.w, height, { tl: 0, tr: 0, bl: 8, br: 8 });
}

export const WORLDS: WorldDef[] = [
  {
    key: 'safari',
    title: 'Safari',
    spokenName: 'savannen',
    emoji: '🦁',
    play: 'safari',
    paint: (g, p) => {
      top(g, p, p.h * 0.6, 0x8fd3f4);
      bottom(g, p, p.h * 0.4, 0xe9c46a);
      g.fillStyle(0xffd23f).fillCircle(p.l + p.w - 30, p.t + 30, 16);
      g.fillStyle(0xa3b18a).fillEllipse(p.l + 40, p.t + p.h * 0.6, 130, 40);
      // Lille akacietræ
      const x = p.l + p.w - 40;
      const y = p.t + p.h * 0.62;
      g.fillStyle(0x6b4423).fillRect(x - 3, y - 45, 6, 45);
      g.fillStyle(0x52734d).fillEllipse(x, y - 50, 80, 18);
    },
  },
  {
    key: 'jungle',
    title: 'Jungle',
    spokenName: 'junglen',
    emoji: '🐒',
    play: 'jungle',
    paint: (g, p) => {
      top(g, p, p.h, 0x2d6a4f);
      bottom(g, p, p.h * 0.2, 0x6f4e37);
      g.fillStyle(0x40916c);
      for (let i = 0; i < 5; i++) g.fillEllipse(p.l + 15 + i * 35, p.t + 12, 60, 40);
      g.lineStyle(4, 0x95d5b2);
      for (const dx of [30, 80, 135]) g.lineBetween(p.l + dx, p.t + 20, p.l + dx + 4, p.t + 70 + (dx % 3) * 10);
      g.fillStyle(0x74c69d).fillEllipse(p.l + 20, p.t + p.h * 0.8, 50, 26).fillEllipse(p.l + p.w - 20, p.t + p.h * 0.78, 56, 30);
    },
  },
  {
    key: 'ice',
    title: 'Isen',
    spokenName: 'isen',
    emoji: '🐧',
    paint: (g, p) => {
      top(g, p, p.h * 0.65, 0xcaf0f8);
      bottom(g, p, p.h * 0.35, 0x48cae4);
      const base = p.t + p.h * 0.65;
      g.fillStyle(0xffffff).fillTriangle(p.l, base, p.l + 60, p.t + 40, p.l + 120, base);
      g.fillStyle(0xe0f4ff).fillTriangle(p.l + 70, base, p.l + 125, p.t + 55, p.l + p.w, base);
      g.fillStyle(0xffffff).fillEllipse(p.l + p.w / 2, base + 30, 140, 26);
    },
  },
  {
    key: 'australia',
    title: 'Australien',
    spokenName: 'Australien',
    emoji: '🦘',
    paint: (g, p) => {
      top(g, p, p.h * 0.6, 0xffb347);
      bottom(g, p, p.h * 0.4, 0xc8553d);
      g.fillStyle(0xfff1a8).fillCircle(p.l + 40, p.t + 35, 20);
      // Det store røde bjerg
      g.fillStyle(0x9c2c13).fillRoundedRect(p.l + 60, p.t + p.h * 0.6 - 40, 100, 50, { tl: 30, tr: 20, bl: 0, br: 0 });
    },
  },
  {
    key: 'sea',
    title: 'Under vandet',
    spokenName: 'havet',
    emoji: '🐠',
    paint: (g, p) => {
      top(g, p, p.h, 0x0096c7);
      g.fillStyle(0x0077b6).fillRect(p.l, p.t + p.h * 0.45, p.w, p.h * 0.4);
      bottom(g, p, p.h * 0.15, 0xf4d58d);
      g.fillStyle(0x2d6a4f).fillEllipse(p.l + 20, p.t + p.h - 35, 16, 60).fillEllipse(p.l + p.w - 25, p.t + p.h - 40, 18, 70);
      g.lineStyle(3, 0xffffff, 0.7);
      for (const [dx, dy, r] of [[130, 30, 7], [140, 55, 5], [125, 75, 4], [30, 40, 5]]) g.strokeCircle(p.l + dx, p.t + dy, r);
    },
  },
  {
    key: 'dino',
    title: 'Dinosaurer',
    spokenName: 'dinosaurerne',
    emoji: '🦖',
    paint: (g, p) => {
      top(g, p, p.h * 0.65, 0xffd6a5);
      bottom(g, p, p.h * 0.35, 0x6a994e);
      const base = p.t + p.h * 0.65;
      // Vulkan med lava og røg
      g.fillStyle(0x6d4c41).fillTriangle(p.l + 50, base, p.l + 105, p.t + 45, p.l + 160, base);
      g.fillStyle(0xe63946).fillTriangle(p.l + 95, p.t + 58, p.l + 105, p.t + 45, p.l + 115, p.t + 58);
      g.fillStyle(0x9e9e9e, 0.8).fillCircle(p.l + 108, p.t + 30, 10).fillCircle(p.l + 120, p.t + 18, 8);
      g.fillStyle(0x386641).fillEllipse(p.l + 25, base + 4, 70, 30);
    },
  },
];
