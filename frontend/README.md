# Frontend (React + Vite + Tailwind)

## Scripts

- `npm run dev` (Vite dev server)
- `npm run build`
- `npm run preview`

## Notes

- The UI submits `{ input: string }` to `POST /analyze` (analysis only; no DB write).
- Saving uses `POST /missions` and `PUT /missions/:id` with the mission brief and line arrays.
- In dev, `vite.config.js` proxies `/analyze` and `/missions` to the backend at `http://localhost:3001` (or `VITE_PROXY_TARGET`).

