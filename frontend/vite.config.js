import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  const isStaging = process.env.VITE_ENVIRONMENT === 'staging'
  
  return {
    plugins: [react()],
    
    // Environment-specific settings
    define: {
      __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(process.env.VITE_BUILD_TIME || new Date().toISOString()),
      __ENVIRONMENT__: JSON.stringify(process.env.VITE_ENVIRONMENT || mode),
    },
    
    // Build optimization
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@chakra-ui/react', '@chakra-ui/icons'],
            routing: ['react-router-dom'],
            forms: ['formik', 'yup', 'react-hook-form'],
            charts: ['recharts', '@nivo/core', '@nivo/line', '@nivo/pie'],
            utils: ['axios', 'uuid']
          }
        }
      }
    },
    
    // Development server
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    
    // Environment variables
    envPrefix: 'VITE_',
    
    // Optimizations
    optimizeDeps: {
      include: ['react', 'react-dom', '@chakra-ui/react']
    }
  }
})
