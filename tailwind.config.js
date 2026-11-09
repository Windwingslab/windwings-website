/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171819',
        brand: {
          DEFAULT: '#FF5900',
          hover: '#FF7A2F',
          deep: '#26110A',
          onLight: '#D94A00',
        },
        deep: '#26110A',
        raise: '#1D1E1F',
        text: '#F4F4F2',
        muted: '#8A8C8E',
        steel: '#A8BBD6',
        'mid-warm': '#54423A',
        'mid-cool': '#48515B',
        // Keep silver alias mapped to brand text for gradual migration
        silver: '#F4F4F2',
      },
      fontFamily: {
        sans: [
          'Geist',
          'PingFang SC',
          'HarmonyOS Sans SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Noto Sans CJK SC',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      maxWidth: {
        shell: '1400px',
      },
      screens: {
        editorial: '900px',
      },
    },
  },
  plugins: [],
}
