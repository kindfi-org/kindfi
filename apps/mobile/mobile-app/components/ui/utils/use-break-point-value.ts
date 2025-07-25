import { useEffect, useState } from 'react'
import { Dimensions, useWindowDimensions } from 'react-native'

import * as tailwindConfig from 'tailwind.config'
import resolveConfig from 'tailwindcss/resolveConfig'

const TailwindTheme = resolveConfig(tailwindConfig as Record<string, unknown>)
const screenSize = TailwindTheme.theme.screens

type breakpoints = keyof typeof screenSize | 'default'

type BreakPointValue = Partial<Record<breakpoints, unknown>>

const resolveScreenWidth: Record<string, unknown> = {
	default: 0,
}

// biome-ignore lint/complexity/noForEach: refactor later
Object.entries(screenSize).forEach(([key, value]) => {
	if (typeof value === 'string') {
		resolveScreenWidth[key] = Number.parseInt(value.replace('px', ''), 10)
	}
})

export const getBreakPointValue = (values: BreakPointValue, width: number) => {
	if (typeof values !== 'object') return values

	let finalBreakPointResolvedValue: unknown
	const mediaQueriesBreakpoints: Record<string, unknown>[] = [
		{
			key: 'default',
			breakpoint: 0,
			isValid: true,
		},
	]
	// biome-ignore lint/complexity/noForEach: refactor later
	Object.keys(resolveScreenWidth).forEach((key) => {
		const isValid = isValidBreakpoint(
			resolveScreenWidth[key as keyof typeof resolveScreenWidth] as number,
			width,
		)

		mediaQueriesBreakpoints.push({
			key: key,
			breakpoint: resolveScreenWidth[key],
			isValid: isValid,
		})
	})

	mediaQueriesBreakpoints.sort(
		(a: Record<string, unknown>, b: Record<string, unknown>) =>
			(a.breakpoint as number) - (b.breakpoint as number),
	)

	mediaQueriesBreakpoints.forEach(
		(breakpoint: Record<string, unknown>, index: number) => {
			breakpoint.value = Object.hasOwn(values, breakpoint.key as string)
				? // @ts-ignore
					values[breakpoint.key]
				: mediaQueriesBreakpoints[index - 1]?.value ||
					mediaQueriesBreakpoints[0]?.value
		},
	)

	const lastValidObject = getLastValidObject(mediaQueriesBreakpoints)

	if (!lastValidObject) {
		finalBreakPointResolvedValue = values
	} else {
		finalBreakPointResolvedValue = lastValidObject?.value
	}
	return finalBreakPointResolvedValue
}

export function useBreakpointValue(values: BreakPointValue): number {
	const { width } = useWindowDimensions()

	const [currentBreakPointValue, setCurrentBreakPointValue] = useState(
		getBreakPointValue(values, width),
	)

	useEffect(() => {
		if (typeof values === 'object') {
			const finalBreakPointResolvedValue = getBreakPointValue(values, width)
			setCurrentBreakPointValue(finalBreakPointResolvedValue)
		}
	}, [values, width])

	if (typeof values !== 'object') return values

	return currentBreakPointValue
}

export function isValidBreakpoint(
	breakPointWidth: number,
	width = Dimensions.get('window')?.width,
) {
	const windowWidth = width

	if (windowWidth >= breakPointWidth) {
		return true
	}
	return false
}

function getLastValidObject(mediaQueries: Record<string, unknown>[]) {
	for (let i = mediaQueries.length - 1; i >= 0; i--) {
		if (mediaQueries[i].isValid) {
			return mediaQueries[i]
		}
	}
	return null // No valid object found
}
