# Frontend Developer Setup Guide

## Local Development Configuration

This frontend connects to the backend API. Each developer can customize their local setup.

### Initial Setup

1. **Configure local settings (optional):**
   ```bash
   # Only needed if you want to customize settings
   cp wrangler.local.jsonc.example wrangler.local.jsonc
   ```
   
   Edit `wrangler.local.jsonc`:
   - Replace `YOUR_NAME` with your identifier
   - Update `API_HOST` if your backend runs on a different port

2. **Set up environment secrets:**
   ```bash
   # Setup your own secrets
   # API_KEY should same as in backend
   cp .dev.vars.example .dev.vars
   ```

### Daily Development

**Start the dev server:**
```bash
# Using default configuration (most common)
pnpm dev

# Or with custom config
npx wrangler pages dev --config wrangler.local.jsonc
```

**Default configuration:**
- Frontend runs on `http://localhost:5173`
- Backend API at `http://localhost:3002`
- Hot Module Replacement (HMR) enabled

## Configuration Strategy

### Files in Version Control
- `wrangler.jsonc` - Shared base configuration
- `wrangler.local.jsonc.example` - Template for local overrides

### Gitignored Files (Developer-Specific)
- `wrangler.local.jsonc` - Your personal local config
- `.dev.vars` - Your local environment variables

### Environment Variables

**API_HOST** - Backend API endpoint:
- Local: `http://localhost:3002`
- Staging: `https://staging-api.downtown65.site`
- Production: `https://api.downtown65.site`

## Running Both Apps Together

**Option 1: Monorepo root (recommended)**
```bash
# From monorepo root - runs both frontend and backend
pnpm dev
```

**Option 2: Separate terminals**
```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm dev
```

## Best Practices

1. **Use default config** - Most developers don't need `wrangler.local.jsonc`
2. **Backend first** - Always start backend before frontend
3. **Check ports** - Ensure backend is running on port 3002
4. **Hot reload** - Frontend automatically reloads on file changes

## Troubleshooting

**"Failed to fetch" or API errors:**
- Ensure backend is running: `curl http://localhost:3002/health`
- Check API_HOST in browser console
- Verify CORS settings in backend

**Port conflicts:**
- Frontend default port: 5173
- Use `--port 5174` to change it
- Check for other Vite projects using the same port

**Build errors:**
- Run `pnpm ci:generate` to regenerate API types
- Ensure backend OpenAPI spec is up to date
