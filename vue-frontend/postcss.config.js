// postcss.config.js
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss(), // <- must have () — it's now a function
    autoprefixer(),
  ],
}
