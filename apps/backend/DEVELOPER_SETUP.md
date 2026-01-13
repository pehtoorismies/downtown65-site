# Developer Setup Guide

## Local Development Configuration

This project supports multiple developers working simultaneously with isolated D1 databases.

### Initial Setup

1. **Create your local D1 database:**
   ```bash
   # Create a new D1 database with your name
   npx wrangler d1 create YOUR_NAME-development
   ```
   Save the `database_id` from the output.

2. **Configure local wrangler settings:**
   ```bash
   # Copy the example file
   cp wrangler.local.jsonc.example wrangler.local.jsonc
   ```
   
   Edit `wrangler.local.jsonc`:
   - Replace `YOUR_NAME` with your identifier (e.g., your GitHub username)
   - Replace `YOUR_DATABASE_ID` with the ID from step 1

3. **Set up local secrets:**
   ```bash
   # Copy the example file
   cp .dev.vars.example .dev.vars
   ```
   
   Edit `.dev.vars` with actual secret values (get from team lead or password manager).

4. **Run migrations on your local database:**
   ```bash

   # Create flat file structure so that wrangler md1 migrations can read it
   # Maybe this will be fixed at some point. Keep eye!
   pnpm run migrations:flatten


   # Use wrangler.local.jsonc
   npx wrangler d1 migrations apply D1_DB --local --config wrangler.local.jsonc
   ```

### Daily Development

**Start the dev server with your local config:**
```bash
# Using wrangler.local.jsonc (recommended)
npx wrangler dev --config wrangler.local.jsonc

# Or using named environment
npx wrangler dev --env YOUR_NAME
```

**Run migrations after pulling updates:**
```bash
npx wrangler d1 migrations apply D1_DB --local --config wrangler.local.jsonc
```

**Access your local D1 console:**
```bash
npx wrangler d1 execute D1_DB --local --config wrangler.local.jsonc --command "SELECT * FROM users"
```

## Configuration Strategy

### Files in Version Control
- `wrangler.jsonc` - Shared configuration and named environments
- `wrangler.local.jsonc.example` - Template for local overrides
- `.dev.vars.example` - Template for local secrets

### Gitignored Files (Developer-Specific)
- `wrangler.local.jsonc` - Your personal local config
- `.dev.vars` - Your local secrets

### Priority Order
Wrangler merges configurations in this order:
1. `wrangler.jsonc` (base config)
2. Environment from `--env` flag (if used)
3. `--config` specified file (overrides everything)

## Named Environments vs Local Override

**Option 1: Named Environment (in wrangler.jsonc)**
- Good for: Team members who need persistent remote dev databases
- Committed to version control
- Used with: `wrangler dev --env YOUR_NAME`

**Option 2: Local Override (wrangler.local.jsonc)**
- Good for: Fully local development with no version control
- Each developer maintains their own
- Used with: `wrangler dev --config wrangler.local.jsonc`

## Best Practices

1. **Never commit secrets** - Use `.dev.vars` for local secrets
2. **Isolated databases** - Each developer should have their own D1 database
3. **Consistent naming** - Use your GitHub username for database names
4. **Document changes** - Update this guide when adding new required config
5. **Fresh migrations** - Run migrations after pulling main branch

## Troubleshooting

**"Database not found" error:**
- Verify your database_id in wrangler.local.jsonc matches your created database
- Run `npx wrangler d1 list` to see all your databases

**"Unauthorized" errors:**
- Check your `.dev.vars` file has correct secret values
- Secrets are loaded automatically by wrangler dev

**Port conflicts:**
- Default port is 8787, use `--port 3002` to change it
- Update package.json dev:backend script accordingly




