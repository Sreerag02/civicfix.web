/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
      colors: {
        bg:       '#020d08', // Deep forest black
        surface:  '#05160e', // Dark moss
        surface2: '#0a2217', // Dark forest green
        border:   '#143324', // Mossy border
        accent:   '#10b981', // Emerald green
        accent2:  '#34d399', // Mint green
        muted:    '#637c6f', // Sage gray
      },
      animation: {
        'fade-up':     'fadeUp 0.5s ease both',
        'fade-in':     'fadeIn 0.4s ease both',
        'float':       'float 3s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
        'scan':        'scan 3s linear infinite',
        'pop-in':      'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both',
        'slide-right': 'slideRight 0.35s ease both',
        'spin-slow':   'spin 8s linear infinite',
        'ping-slow':   'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        fadeUp:     { from:{ opacity:0, transform:'translateY(20px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        fadeIn:     { from:{ opacity:0 }, to:{ opacity:1 } },
        float:      { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-10px)' } },
        glowPulse:  { '0%,100%':{ boxShadow:'0 0 8px rgba(16,185,129,0.2)' }, '50%':{ boxShadow:'0 0 28px rgba(16,185,129,0.5)' } },
        scan:       { '0%':{ transform:'translateY(-100%)' }, '100%':{ transform:'translateY(100vh)' } },
        popIn:      { '0%':{ opacity:0, transform:'scale(0.8)' }, '70%':{ transform:'scale(1.05)' }, '100%':{ opacity:1, transform:'scale(1)' } },
        slideRight: { from:{ opacity:0, transform:'translateX(-16px)' }, to:{ opacity:1, transform:'translateX(0)' } },
      },
      boxShadow: {
        glow:    '0 0 20px rgba(16,185,129,0.25)',
        'glow-lg':'0 0 40px rgba(16,185,129,0.35)',
        card:    '0 4px 24px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.04'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'dot-pattern':  "radial-gradient(circle, rgba(16,185,129,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
