# Cloudflare Workers Deployment Guide

## Current Status

The Worker has been deployed to: `https://cloudflare-analytics-dashboard.bhetariah.workers.dev`

## Known Issues & Troubleshooting

### Issue: Worker Returns "error code: 1042"

If you encounter this error when testing the deployed Worker:

1. **Wait 5-10 minutes** - Workers sometimes take time to propagate globally
2. **Check Worker logs**: `wrangler tail`
3. **Test locally first**: `wrangler dev worker.js --local`
4. **Verify deployment**: `wrangler deployments list`

### Alternative Deployment Methods

If the current deployment isn't working:

#### Option 1: Use Different Worker Name
```bash
# Edit wrangler.toml and change the name
name = "analytics-dashboard-[your-name]"
wrangler deploy
```

#### Option 2: Deploy to Custom Domain
```bash
# Add custom domain routes in wrangler.toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

#### Option 3: Test with Local Development
```bash
# Run Worker locally
wrangler dev worker.js --local
# Test at http://localhost:8787

# Run frontend
npm run dev
# Set VITE_WORKER_URL=http://localhost:8787 in .env
```

## Testing Your Deployment

### 1. Health Check
```bash
curl https://your-worker-url.workers.dev/health
```
Expected response:
```json
{
  "status": "OK",
  "message": "Cloudflare Analytics Dashboard Worker is running",
  "timestamp": "2024-09-15T21:25:33.646Z"
}
```

### 2. CORS Test
```bash
curl -H "Origin: http://localhost:3000" https://your-worker-url.workers.dev/health
```

### 3. API Validation Test
```bash
curl "https://your-worker-url.workers.dev/api/cloudflare/validate/YOUR_ZONE_ID?apiToken=YOUR_API_TOKEN"
```

## Frontend Configuration

Update your `.env` file:
```env
VITE_WORKER_URL=https://your-deployed-worker-url.workers.dev
```

The frontend will automatically fall back to:
1. Configured Worker URL
2. Local proxy server (port 3001)
3. Direct API calls (CORS limited)
4. Mock data

## Deployment Commands

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler auth login

# Deploy Worker
wrangler deploy

# View logs
wrangler tail

# List deployments
wrangler deployments list
```

## Support

If deployment issues persist:
1. Check Cloudflare dashboard for Worker status
2. Verify your account has Workers enabled
3. Try deploying with a different Worker name
4. Use local development mode as fallback