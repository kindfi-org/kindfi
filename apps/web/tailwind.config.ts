import type { Config } from 'tailwindcss'

const breakPoints = {
	xs: '320px',
	sm: '440px',
	md: '720px',
	'ml-lg': '900px',
	lg: '1080px',
	'lg-xl': '1260px',
	xl: '1440px',
	'2xl': '1600px',
	'2.5xl': '1880px',
	'3xl': '2160px',
}

const config = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	prefix: '',
	theme: {
		screens: breakPoints,
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: breakPoints,
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(140, 60%, 35%)', // Green
					50: 'hsl(140, 30%, 95%)', 
					100: 'hsl(140, 40%, 85%)',
					200: 'hsl(140, 45%, 75%)',
					300: 'hsl(140, 50%, 65%)',
					400: 'hsl(140, 55%, 55%)',
					500: 'hsl(140, 60%, 35%)',
					600: 'hsl(140, 65%, 30%)',
					700: 'hsl(140, 70%, 25%)',
					800: 'hsl(140, 75%, 20%)',
					900: 'hsl(140, 80%, 15%)',
				},
				secondary: {
					DEFAULT: 'hsl(220, 40%, 40%)', // Navy Blue
					50: 'hsl(220, 20%, 95%)',
					100: 'hsl(220, 25%, 85%)',
					200: 'hsl(220, 30%, 75%)',
					300: 'hsl(220, 35%, 65%)',
					400: 'hsl(220, 35%, 55%)',
					500: 'hsl(220, 40%, 40%)',
					600: 'hsl(220, 45%, 30%)',
					700: 'hsl(220, 50%, 25%)',
					800: 'hsl(220, 55%, 20%)',
					900: 'hsl(220, 60%, 15%)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
