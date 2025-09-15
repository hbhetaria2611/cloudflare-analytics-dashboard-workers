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

### Option 2: Use Real Cloudflare Data
Due to CORS restrictions, you need to run a proxy server to access the Cloudflare API:

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
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

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