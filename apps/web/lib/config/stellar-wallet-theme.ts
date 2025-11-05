import { SwkAppLightTheme, type SwkAppTheme } from '@creit-tech/stellar-wallets-kit/types'

/**
 * Custom theme configuration for Stellar Wallets Kit
 * Matches the app's design system with solid backgrounds to prevent transparency issues
 *
 * Colors are derived from globals.css:
 * - Background: hsl(222, 50%, 97%) → Pure white for modal visibility
 * - Primary: hsl(99, 57.1%, 56.1%) = #7CC635 (green)
 * - Foreground: hsl(222, 5%, 10%) = #181819 (dark gray)
 */
export function getStellarWalletTheme(): SwkAppTheme {
	return {
		...SwkAppLightTheme,
		// Solid background colors - no transparency
		// Use pure white for modal content to ensure visibility
		background: '#ffffff', // Pure white for modal background
		'background-secondary': '#f8f9fa', // Light gray for secondary backgrounds
		// Foreground colors
		'foreground-strong': '#181819', // Matches --foreground from globals.css (hsl(222, 5%, 10%))
		foreground: '#181819', // Dark text
		'foreground-secondary': '#4a4a4f', // Secondary text
		// Primary colors
		primary: '#7CC635', // App's primary green color (matches hsl(99, 57.1%, 56.1%))
		'primary-foreground': '#ffffff', // White text on primary
		// Utility colors
		transparent: 'transparent',
		lighter: '#f8f8f8',
		light: '#e8e8e8',
		'light-gray': '#d1d1d1',
		gray: '#9a9a9a',
		danger: '#ff3333', // Error/destructive color
		border: '#d1d1d1', // Border color
		shadow: 'rgba(0, 0, 0, 0.1)', // Shadow color
		'border-radius': '0.75rem', // Match app's border radius
		'font-family': 'inherit', // Use app's font family
	}
}

