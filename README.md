# CookEase

CookEase is a React kitchen companion for tracking ingredients, discovering meal ideas, managing a shopping list, and reducing food waste.

## Run locally

Requirements: Node.js 18 or 20 and npm.

```bash
npm install
npm start
```

The development server opens at `http://localhost:3000`.

## Production build

```bash
npm run build
```

The production files are generated in `build/`.

## Deploy to Vercel

- Import the GitHub repository into Vercel.
- Framework preset: Create React App (or Other if the preset is unavailable).
- Build command: `npm run build`
- Output directory: `build`
- Install command: `npm install`
- Keep `vercel.json` in the repository so client-side routes load correctly when opened directly.

## Current data and sign-in behavior

This version keeps fridge items, shopping items, and saved recipes in the current browser using local storage. The landing page's calls to action open the existing app. There is no account authentication or cloud database configured in the supplied code, so this package does not pretend to provide secure login or cross-device syncing. Those features require connecting an authentication/database service.

## Notes

- Food photography on the landing page loads from Unsplash and therefore requires an internet connection.
- Barcode lookup uses the Open Food Facts public API; camera scanning requires browser camera permission and a secure context (HTTPS, or localhost).
