# Frontend Template

This frontend is a minimal React 19 + React Router 7 + React Query starter wired to the backend template.

Included by default:

- Better Auth client with login and signup flows
- Protected admin area with a simple dashboard shell
- Sidebar layout and permission-aware UI helpers
- OpenAPI type sync script for future backend endpoints

Useful commands:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run sync-schema
```

The app expects the backend template to run on `http://localhost:3000` unless `VITE_BACKEND_URL` is overridden.
