declare module 'get-contrast' {
	export function ratio(color1: string, color2: string): number
	export function score(color1: string, color2: string): 'AAA' | 'AA' | 'fail'
	export function isAccessible(color1: string, color2: string): boolean
}
