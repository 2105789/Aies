import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',
  css: ['~/assets/css/main.css'],
  modules: ['@pinia/nuxt'],
  ssr: false, // Client-side only for camera access
  devServer: {
    host: '0.0.0.0' // Allow access from other devices on network
  },
  vite: {
    plugins: [tailwindcss()]
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    murfApiKey: process.env.MURF_API_KEY,
    public: {
      appVersion: process.env.APP_VERSION || '1.0.0'
    }
  },
  nitro: {
    preset: 'static'
  }
})
