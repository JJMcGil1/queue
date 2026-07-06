# Queue

A personal watchlist for movies, TV shows, documentaries, and anime. Save titles with poster art, track what you're watching, and keep everything in a local SQLite database — no accounts, no cloud.

## Stack

- Electron + electron-vite
- React 18 + TypeScript
- Tailwind CSS 4
- better-sqlite3 (data lives in the app's user-data folder)

## Develop

```sh
npm install
npm run dev
```

## Package

```sh
npm run dist
```

Outputs a signed-unpacked app in `dist/`.
