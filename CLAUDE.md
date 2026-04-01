# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Install dependencies in all apps
npm run install:all

# Start all dev servers concurrently (shell:3000, header:3001, banner:3002)
npm start

# Start individual apps
npm start --prefix shell
npm start --prefix header
npm start --prefix banner
```

### Production Build

```bash
# Build all apps and merge outputs into dist/
npm run build

# Build individual apps
npm run build:header
npm run build:banner
npm run build:shell

# Merge build outputs into unified dist/
npm run build:merge
```

## Architecture

This is a **Webpack 5 Module Federation** monorepo with three independent apps:

| App | Framework | Port | Role |
|-----|-----------|------|------|
| `shell/` | Vanilla JS (hosts Vue + React) | 3000 | Host / Consumer |
| `header/` | Vue 3 | 3001 | Remote — exposes `./Header` |
| `banner/` | React 18 | 3002 | Remote — exposes `./Banner` |

There is also an external remote (`field`) served from a Vercel deployment.

### How remotes are loaded

Shell's `src/bootstrap.js` calls mount functions from `src/load-remotes.js`. Each function:
1. Dynamically imports the framework (Vue or React)
2. Imports the federated module (e.g., `header/Header`)
3. Mounts the component into a DOM container

### Async boundary pattern

Every app uses a two-file entry strategy required by Module Federation:
- `src/index.js` — async entry point that only does `import('./bootstrap')`
- `src/bootstrap.js` — actual app initialization (runs after shared dependency negotiation)

### Shared dependencies

React, React-DOM, and Vue are all configured as `singleton: true, eager: true`. This prevents duplicate instances (which break React hooks) and ensures a single shared copy across host and remotes.

### Environment-based remote URLs

Shell's `webpack.config.js` reads from `shell/.env` to configure remote URLs:
- **Dev:** `http://localhost:3001/remoteEntry.js`, `http://localhost:3002/remoteEntry.js`
- **Prod:** Same-domain subpaths `/header/remoteEntry.js`, `/banner/remoteEntry.js`

This allows switching between monorepo and multi-repo deployments by changing only the env vars.

### Production build structure

`scripts/merge-dist.js` combines individual app builds into:
```
dist/
  ├── index.html, main.js, ...   (shell output)
  ├── header/
  │   └── remoteEntry.js, ...
  └── banner/
      └── remoteEntry.js, ...
```

Vercel serves this `dist/` directory with CORS headers on `/header/` and `/banner/` routes, and rewrites all non-module paths to `index.html` for SPA routing.
