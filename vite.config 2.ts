import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
	'metrics.hnbhetaria.com',
	'192.168.1.43:3000'
		],
  port: 3000,
  host: true
  }
})