/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate'

export default {
	darkMode: 'class', // Important!
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
		},
	},
	plugins: [animate],
}
