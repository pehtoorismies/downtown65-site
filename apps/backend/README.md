# Cloudflare Worker Secrets

This document lists all secrets that must be configured in Cloudflare Workers.

## Required Secrets

### Local Development
For local development
```bash
touch dev.vars
cat > .dev.vars << 'EOF'
AUTH_CLIENT_SECRET=<get from auth zero>
REGISTER_SECRET=<your-register-secret-here>
EOF
```

### Development server

```bash
wrangler secret put AUTH_CLIENT_SECRET --env <your_user_name>
wrangler secret put REGISTER_SECRET --env <your_user_name>
```



### Staging
```bash
wrangler secret put AUTH_CLIENT_SECRET --env staging
wrangler secret put REGISTER_SECRET --env staging
```

### Production
```bash
wrangler secret put AUTH_CLIENT_SECRET --env production
wrangler secret put REGISTER_SECRET --env production
```

## Secret Descriptions

- `AUTH_CLIENT_SECRET`: Auth0 client secret for authentication
- `REGISTER_SECRET`: Secret key required for user registration

## Verification

To verify secrets are set:
```bash
wrangler secret list --env production
```