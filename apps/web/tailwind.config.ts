import type { Config } from 'tailwindcss'

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
		screens: {
			xs: '320px',
			sm: '440px',
			md: '720px',
			lg: '1080px',
			xl: '1440px',
			'2xl': '1600px',
			'3xl': '2160px',
		},
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: {
				xs: '320px',
				sm: '440px',
				md: '720px',
				lg: '1080px',
				xl: '1440px',
				'2xl': '1600px',
				'3xl': '2160px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(140, 60%, 40%)', // Green
					50: 'hsl(140, 60%, 95%)', 
					100: 'hsl(140, 60%, 85%)',
					200: 'hsl(140, 60%, 75%)',
					300: 'hsl(140, 60%, 65%)',
					400: 'hsl(140, 60%, 55%)',
					500: 'hsl(140, 60%, 40%)',
					600: 'hsl(140, 60%, 30%)',
					700: 'hsl(140, 60%, 25%)',
					800: 'hsl(140, 60%, 20%)',
					900: 'hsl(140, 60%, 15%)',
				},
				secondary: {
					DEFAULT: 'hsl(220, 40%, 20%)', // Navy Blue
					50: 'hsl(220, 40%, 95%)',
					100: 'hsl(220, 40%, 85%)',
					200: 'hsl(220, 40%, 75%)',
					300: 'hsl(220, 40%, 65%)',
					400: 'hsl(220, 40%, 55%)',
					500: 'hsl(220, 40%, 40%)',
					600: 'hsl(220, 40%, 30%)',
					700: 'hsl(220, 40%, 25%)',
					800: 'hsl(220, 40%, 20%)',
					900: 'hsl(220, 40%, 15%)',
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
