/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Playfair Display"', '"Chonburi"', 'serif'],
                sans: ['"Lato"', '"Prompt"', 'sans-serif'],
            },
            colors: {
                'wedding-beige': '#F9F5F2',
                'wedding-dark': '#4A4A4A',
                'wedding-green': '#5D7052',
            }
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: ["light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter", "dim", "nord", "sunset"],
    },
}
