# Safari 🦁

Et simpelt safari-spil til små børn (ca. 4 år). Gameplay og glæde kommer før grafik.

## Tech stack
- **TypeScript** som sprog
- **Phaser 3** som 2D-spilmotor (scener, touch-input, tweens, lyd)
- **Vite** som dev-server og build
- Målplatform: **browser på tablet** (touch først), evt. som PWA senere
- Grafik i starten: **emojis** som dyr (🐘🦒🦓🦁🐒🦛🐊). Skiftes til sprites senere.

## Kom i gang
Kræver Node.js (LTS).

```bash
npm install
npm run dev      # starter dev-server med live reload
npm run build    # bygger til dist/
```

## Designregler (målgruppe: 4 år)
- **Ingen tekst nødvendig.** Brug ikoner, lyd og oplæst tale.
- **Kun tryk/klik.** Intet tastatur, ingen træk-gestures med præcision.
- **Store mål:** Interaktive elementer skal være mindst ~120px.
- **Man kan ikke tabe.** Ingen timer, ingen game over, ingen straf.
- **Øjeblikkelig respons:** Hvert tryk giver lyd og/eller animation.
- **Kort og simpelt:** Én ting at gøre ad gangen. Masser af ros (🎉, konfetti, jubel).
- Ingen reklamer, køb eller links ud af spillet.

## Konventioner
- Kode og identifiers på engelsk. Kommentarer og docs må gerne være på dansk.
- Én Phaser-scene pr. fil i `src/scenes/`.
- Assets (lyd/billeder) i `public/assets/`.
