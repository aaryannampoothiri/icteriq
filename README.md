# VillageGuard

Jaundice early-warning dashboard covering a 100 km radius around Kothri, Madhya Pradesh.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- Leaflet

## Development

```bash
npm install
npm run dev
```

## Build & Lint

```bash
npm run build
npm run lint
```

## Backend Integration

Data access is isolated in `src/services/api.ts`. Set `VITE_API_BASE_URL` in `.env` to connect to a Python backend serving `/api/villages` and `/api/alerts`.
