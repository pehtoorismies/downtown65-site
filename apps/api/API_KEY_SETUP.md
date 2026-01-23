# API Key Authentication Setup

## Overview

All API routes (except `/healthz`, `/doc`, and `/scalar`) require X-API-Key authentication.

## Environment Configuration

### Local Development

The API key is configured in two places:

1. **wrangler.jsonc** - For the default development environment:
```jsonc
"vars": {
  "API_KEY": "dev-api-key-change-in-production"
}
```

2. **.dev.vars** - For local secrets:
```
API_KEY=dev-api-key-change-in-production
```

### Production

For production deployment, set the API key as a secret:

```bash
# For default environment
pnpm wrangler secret put API_KEY

# For specific environment (staging/production)
pnpm wrangler secret put API_KEY --env production
```

When prompted, enter your production API key.

## Using the API

### Making Requests

Include the `X-API-Key` header in all API requests:

```bash
# Example: Get all events
curl -H "X-API-Key: dev-api-key-change-in-production" \
  https://api.downtown65.site/events

# Example: Login
curl -X POST \
  -H "X-API-Key: dev-api-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  https://api.downtown65.site/auth/login
```

### Response Codes

- **200/201** - Success
- **401** - Missing or invalid API key
  ```json
  {
    "error": "Invalid API key",
    "message": "The provided API key is not valid"
  }
  ```
- **422** - Validation error
- **404** - Resource not found

## Protected Routes

The following routes require X-API-Key authentication:

### Auth Routes
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/forgot-password`
- `POST /auth/refresh-token`

### Event Routes
- `GET /events`
- `GET /events/{id}`
- `POST /events`
- `PATCH /events/{id}`
- `DELETE /events/{id}`

## Public Routes

The following routes are publicly accessible:

- `GET /healthz` - Health check endpoint
- `GET /doc` - OpenAPI JSON specification
- `GET /scalar` - API documentation UI

## Security Best Practices

1. **Never commit API keys** - The `.dev.vars` file is gitignored
2. **Use different keys per environment** - Development, staging, and production should have unique keys
3. **Rotate keys regularly** - Update production keys periodically
4. **Keep keys secret** - Do not share keys in public repositories or documentation
5. **Frontend configuration** - Store the API key in environment variables, never hardcode

## Frontend Integration

The frontend needs to send the API key with every request. Example configuration:

```typescript
// apps/frontend/app/api/api-client.ts
import createClient from 'openapi-fetch'
import type { paths } from './generated/api'

export const apiClient = createClient<paths>({
  baseUrl: 'https://api.downtown65.site',
  headers: {
    'X-API-Key': import.meta.env.VITE_API_KEY, // or process.env.API_KEY
  },
})
```

Add to frontend wrangler.jsonc:
```jsonc
"vars": {
  "API_KEY": "dev-api-key-change-in-production"
}
```
