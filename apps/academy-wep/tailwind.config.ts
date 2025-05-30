import type { Config } from 'tailwindcss'

const breakPoints = {
	xs: '320px',
	sm: '440px',
	md: '720px',
	'md-lg': '900px',
	lg: '1080px',
	'lg-xl': '1260px',
	xl: '1440px',
	'xl-2xl': '1520px',
	'2xl': '1600px',
	'2xl-3xl': '1880px',
	'2xl-3xl-mid': '2020px',
	'3xl': '2160px',
}

const config = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
		'./lib/**/*.{ts,tsx}',
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
					'50': 'hsl(var(--primary-50))',
					'100': 'hsl(var(--primary-100))',
					'200': 'hsl(var(--primary-200))',
					'300': 'hsl(var(--primary-300))',
					'400': 'hsl(var(--primary-400))',
					'500': 'hsl(var(--primary-500))',
					'600': 'hsl(var(--primary-600))',
					'700': 'hsl(var(--primary-700))',
					'800': 'hsl(var(--primary-800))',
					'900': 'hsl(var(--primary-900))',
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					'50': 'hsl(var(--secondary-50))',
					'100': 'hsl(var(--secondary-100))',
					'200': 'hsl(var(--secondary-200))',
					'300': 'hsl(var(--secondary-300))',
					'400': 'hsl(var(--secondary-400))',
					'500': 'hsl(var(--secondary-500))',
					'600': 'hsl(var(--secondary-600))',
					'700': 'hsl(var(--secondary-700))',
					'800': 'hsl(var(--secondary-800))',
					'900': 'hsl(var(--secondary-900))',
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
					},
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
					},
					to: {
						height: '0',
					},
				},
				fadeIn: {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				fadeOut: {
					'0%': {
						opacity: '1',
					},
					'100%': {
						opacity: '0',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'fade-out': 'fadeOut 0.3s ease-in-out',
			},
			transitionDuration: {
				default: '200ms',
				slow: '500ms',
				fast: '300ms',
			},
		},
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
