# Safari 🦁

Et simpelt safari-spil til en 4-årig. Indie-projekt, hvor gameplay og glæde kommer før grafik.

## Tech stack
- **TypeScript** som sprog
- **Phaser 3** som 2D-spilmotor (scener, touch-input, tweens, lyd)
- **Vite** som dev-server og build (`npm run dev`, `npm run build` → `dist/`)
- Målplatform: **browser på tablet** (touch først), evt. som PWA senere
- Grafik i starten: **emojis** som dyr (🐘🦒🦓🦁🐒🦛🐊). Skiftes til sprites senere.

## Designregler (målgruppe: 4 år)
- **Ingen tekst nødvendig.** Han kan ikke læse. Brug ikoner, lyd og oplæst tale.
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

## Miljø
- Udvikles i WSL2 (Linux). Node.js skal installeres (fx via nvm) før første `npm install`.
- GitHub: https://github.com/ollen2025/safari (branch `main`)

## Huskeliste / beslutninger
- (tilføj løbende vigtige beslutninger her)
