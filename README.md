# Cloudflare Analytics Dashboard

A modern, Grafana-style dashboard for monitoring Cloudflare analytics in real-time. Built with React, TypeScript, and Recharts.

## Features

- 📊 **Real-time Analytics**: Live data from Cloudflare's Analytics API
- 🎨 **Grafana-style UI**: Dark theme with professional dashboard aesthetics
- 📈 **Interactive Charts**: Requests, bandwidth, geographic distribution, and status codes
- 🔄 **Auto-refresh**: Configurable refresh intervals
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **Secure**: API tokens stored locally, never transmitted

## Screenshots

The dashboard includes:
- Total requests, bandwidth, threats blocked, and cache hit rate metrics
- Time-series charts for requests and bandwidth over time
- Geographic distribution of traffic by country
- HTTP status code distribution pie chart

## Quick Start

### Option 1: Use Mock Data (Easiest)
1. **Install and start:**
   ```bash
   npm install
   npm run dev
   ```

2. **Open http://localhost:3000** and click "Use Mock Data"

### Option 2: Use Real Cloudflare Data (Local Development)
For local development, you can use the Express.js proxy server:

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install and start the proxy server:**
   ```bash
   cd api
   npm install
   npm start
   ```

3. **In a new terminal, start the frontend:**
   ```bash
   npm run dev
   ```

4. **Configure your real Cloudflare credentials:**
   - Open http://localhost:3000
   - Click "Get Started" and enter your real Zone ID and API Token

### Option 3: Deploy with Cloudflare Workers (Production)
For production deployment using Cloudflare Workers:

1. **Install dependencies including Wrangler:**
   ```bash
   npm install
   ```

2. **Configure your Worker URL:**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_WORKER_URL to your deployed Worker URL
   ```

3. **Deploy the Worker:**
   ```bash
   npm run worker:deploy
   ```

4. **Build and deploy the frontend:**
   ```bash
   npm run build
   # Deploy the 'dist' folder to Cloudflare Pages, Netlify, or your preferred host
   ```

5. **Configure your real Cloudflare credentials:**
   - Open your deployed dashboard
   - Click "Get Started" and enter your real Zone ID and API Token

## Cloudflare Setup

### Getting Your API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the "Custom token" template
4. Configure permissions:
   - **Zone:Zone:Read** (to read zone information)
   - **Zone:Analytics:Read** (to read analytics data)
5. Set zone resources to include your domain
6. Copy the generated token

### Getting Your Zone ID

1. Go to your domain's overview page in the Cloudflare dashboard
2. Scroll down to the "API" section on the right sidebar
3. Copy the Zone ID

## Environment Variables (Optional)

You can pre-configure credentials using environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your values:
```
VITE_CLOUDFLARE_ZONE_ID=your_zone_id_here
VITE_CLOUDFLARE_API_TOKEN=your_api_token_here
VITE_CLOUDFLARE_EMAIL=your_email@example.com

# For Workers deployment:
VITE_WORKER_URL=https://cloudflare-analytics-dashboard.your-subdomain.workers.dev
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Cloudflare Workers
- `npm run worker:dev` - Start Worker in development mode
- `npm run worker:deploy` - Deploy Worker to Cloudflare
- `npm run worker:tail` - View Worker logs in real-time

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **date-fns** - Date formatting
- **Lucide React** - Icons

## API Integration

The dashboard integrates with Cloudflare's Analytics API endpoints:
- `/zones/{zone_id}/analytics/dashboard` - Main analytics data
- Automatic fallback to mock data if API is unavailable
- Built-in error handling and retry logic

## Cloudflare Workers Deployment

For production deployment, this project includes a Cloudflare Worker that replaces the Express.js proxy server:

### Prerequisites
1. **Cloudflare account** with Workers enabled
2. **Wrangler CLI** installed globally: `npm install -g wrangler`
3. **Authenticated Wrangler**: `wrangler auth login`

### Deployment Steps

1. **Configure the Worker:**
   ```bash
   # Edit wrangler.toml to set your desired worker name
   nano wrangler.toml
   ```

2. **Deploy the Worker:**
   ```bash
   npm run worker:deploy
   ```

3. **Update environment variables:**
   ```bash
   # Copy the Worker URL from deployment output
   # Update your .env file:
   VITE_WORKER_URL=https://your-worker-name.your-subdomain.workers.dev
   ```

4. **Build and deploy frontend:**
   ```bash
   npm run build
   # Deploy the 'dist' folder to your preferred hosting service
   ```

### Worker Features
- **CORS handling** for cross-origin requests
- **Cloudflare API proxying** to bypass browser CORS restrictions
- **Error handling** with detailed error responses
- **Health checks** for monitoring
- **Zero cold-start** latency for API requests

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Security

- API tokens are stored in browser memory only
- No server-side data storage
- HTTPS-only API communication
- No logging of sensitive information