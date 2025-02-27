export const safeParseFloat = (value: string): number => {
	const parsed = Number.parseFloat(value.replace(/[^0-9.-]+/g, ''))
	return Number.isNaN(parsed) ? 0 : parsed
}
