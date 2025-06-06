/**
 * Shared theme colors for impact components
 * These colors map theme token names to their corresponding hex values
 */
export const IMPACT_THEME_COLORS = {
	'success-600': '#16a34a',
	'blue-600': '#2563eb',
	'yellow-600': '#ca8a04',
	'orange-600': '#ea580c',
} as const

/**
 * Type for theme color keys
 */
export type ThemeColorKey = keyof typeof IMPACT_THEME_COLORS

/**
 * Utility function to get icon color from theme or return the original color
 * @param colorName - Either a theme color key or a hex color value
 * @returns The corresponding hex color value
 */
export function getThemeColor(colorName: string): string {
	return IMPACT_THEME_COLORS[colorName as ThemeColorKey] || colorName
}
