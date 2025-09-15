import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: process.env.VITE_ALLOWED_HOSTS
      ? process.env.VITE_ALLOWED_HOSTS.split(',').map(host => host.trim())
      : ['localhost'],
    port: parseInt(process.env.VITE_PORT || '3000'),
    host: process.env.VITE_HOST === 'false' ? false : true
  }
})