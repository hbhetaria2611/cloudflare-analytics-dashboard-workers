# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare Analytics Dashboard - a React/TypeScript application that provides a Grafana-style interface for monitoring Cloudflare analytics in real-time. The project consists of:

- **Frontend**: React 18 + TypeScript + Vite application with Recharts for data visualization
- **Backend**: Express.js proxy server to handle CORS restrictions with Cloudflare's API
- **Dual Mode**: Supports both real Cloudflare API data and mock data for demos

## Development Commands

### Frontend (Root Directory)
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (runs TypeScript compilation + Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with TypeScript rules
- `npm run typecheck` - Run TypeScript type checking without emitting files

### Backend Proxy Server (api/ Directory)
- `cd api && npm install` - Install proxy server dependencies
- `cd api && npm start` - Start proxy server on port 3001
- `cd api && npm run dev` - Start proxy server with nodemon for development

### Full Development Setup
For real Cloudflare data, both servers need to be running:
1. `cd api && npm start` (proxy server)
2. `npm run dev` (frontend)

## Architecture

### Frontend Structure
- `src/App.tsx` - Main application component with dashboard layout
- `src/components/` - Reusable UI components (charts, metric cards, config panel)
- `src/hooks/useCloudflareData.ts` - Custom hook for data fetching and state management
- `src/services/cloudflare.ts` - CloudflareService class handling API communication
- `src/types/cloudflare.ts` - TypeScript interfaces for Cloudflare API data

### Key Architectural Patterns
- **Service Layer**: `CloudflareService` class manages API configuration, validation, and data fetching
- **Dual Data Sources**: Automatic fallback from real API → proxy server → mock data
- **Error Handling**: Comprehensive error handling with user-friendly messages for common Cloudflare API issues (CORS, permissions, rate limits)
- **State Management**: Custom React hook (`useCloudflareData`) for centralized data state

### API Integration
- **Primary**: Cloudflare Analytics API via proxy server (handles CORS)
- **Fallback**: Direct API calls (limited by CORS in browsers)
- **Demo Mode**: Built-in mock data generator for demonstrations

### Build Configuration
- **Vite**: Modern build tool with React plugin
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `src/*`)
- **ESLint**: TypeScript-aware linting with React hooks rules
- **Custom Server Config**: Configured for specific allowed hosts in `vite.config.ts`

## Common Development Tasks

### Adding New Chart Components
1. Create component in `src/components/` following existing chart patterns
2. Import and use in `App.tsx` dashboard grid
3. Data should come from `useCloudflareData` hook

### Working with Cloudflare API
- Service handles authentication, CORS, and error cases automatically
- Mock data structures match real API responses exactly
- All API types are defined in `src/types/cloudflare.ts`

### Environment Configuration
- Optional `.env` file for pre-configuring Cloudflare credentials
- Variables: `VITE_CLOUDFLARE_ZONE_ID`, `VITE_CLOUDFLARE_API_TOKEN`, `VITE_CLOUDFLARE_EMAIL`

## Testing & Deployment

The project supports three deployment modes:
1. **Mock Data Only**: Frontend only, no proxy needed
2. **Development**: Both frontend and proxy server for real API access
3. **Production**: Static build can be deployed anywhere, proxy server can be deployed separately

Always run `npm run typecheck` and `npm run lint` before committing changes.