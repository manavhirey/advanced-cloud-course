import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#0A0F1C',      // page background — blue-black, the ops-room dark
        panel: '#101828',      // raised surface
        raise: '#15203A',      // hover surface
        hairline: '#1D2940',   // borders
        trench: '#141D33',     // inset track (bars, empty heatmap cells)
        foam: '#E8EDF7',       // primary text
        fog: '#8493AB',        // secondary text
        accent: '#5B8CFF',     // control-plane blue (from Kubernetes brand blue)
        ok: '#3ECF8E',         // Complete
        warn: '#E8B44C',       // Running
        crit: '#F26D6D',       // errors
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
} satisfies Config
