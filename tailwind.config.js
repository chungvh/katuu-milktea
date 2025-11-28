/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode with class strategy
    theme: {
        extend: {
            animation: {
                'fade-in-pop': 'fadeInPop 0.3s ease-out',
                'fade-in-out': 'fadeInOut 4s ease-in-out',
                'draw-check': 'drawCheck 0.5s ease-out forwards',
            },
            keyframes: {
                fadeInPop: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                fadeInOut: {
                    '0%, 100%': { opacity: '0' },
                    '10%, 90%': { opacity: '1' },
                },
                drawCheck: {
                    '0%': { strokeDashoffset: '100' },
                    '100%': { strokeDashoffset: '0' },
                },
            },
        },
    },
    plugins: [],
}
