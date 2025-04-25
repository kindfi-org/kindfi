import { useEffect, useState } from 'react'
import { Dimensions, useWindowDimensions } from 'react-native'

import * as tailwindConfig from 'tailwind.config'
import resolveConfig from 'tailwindcss/resolveConfig'

const TailwindTheme = resolveConfig(tailwindConfig as unknown)
const screenSize = TailwindTheme.theme.screens

type breakpoints = keyof typeof screenSize | 'default'

type BreakPointValue = Partial<Record<breakpoints, unknown>>

type MediaQueryBreakpoint = {
	key: string
	breakpoint: number
	isValid: boolean
	value?: unknown
}

type ResolveScreenWidth = {
	default: number
	[key: string]: number
}

const resolveScreenWidth: ResolveScreenWidth = {
	default: 0,
}

for (const [key, value] of Object.entries(screenSize)) {
	if (typeof value === 'string') {
		resolveScreenWidth[key] = Number.parseInt(value.replace('px', ''), 10)
	}
}

export const getBreakPointValue = (values: BreakPointValue, width: number) => {
	if (typeof values !== 'object') return values

	let finalBreakPointResolvedValue: unknown

	const mediaQueriesBreakpoints: MediaQueryBreakpoint[] = [
		{
			key: 'default',
			breakpoint: 0,
			isValid: true,
		},
	]

	for (const key of Object.keys(resolveScreenWidth)) {
		const isValid = isValidBreakpoint(resolveScreenWidth[key], width)

		mediaQueriesBreakpoints.push({
			key: key,
			breakpoint: resolveScreenWidth[key],
			isValid: isValid,
		})
	}

	mediaQueriesBreakpoints.sort((a, b) => a.breakpoint - b.breakpoint)

	for (let index = 0; index < mediaQueriesBreakpoints.length; index++) {
		const breakpoint = mediaQueriesBreakpoints[index]
		breakpoint.value = Object.prototype.hasOwnProperty.call(
			values,
			breakpoint.key,
		)
			? // @ts-ignore
				values[breakpoint.key]
			: mediaQueriesBreakpoints[index - 1]?.value ||
				mediaQueriesBreakpoints[0]?.value
	}

	const lastValidObject = getLastValidObject(mediaQueriesBreakpoints)

	if (!lastValidObject) {
		finalBreakPointResolvedValue = values
	} else {
		finalBreakPointResolvedValue = lastValidObject?.value
	}
	return finalBreakPointResolvedValue
}

export function useBreakpointValue(values: BreakPointValue): unknown {
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
	width: number = Dimensions.get('window')?.width,
) {
	const windowWidth = width

	if (windowWidth >= breakPointWidth) {
		return true
	}
	return false
}

function getLastValidObject(mediaQueries: Record<string, unknown>[]) {
	for (let i = mediaQueries?.length - 1; i >= 0; i--) {
		if (mediaQueries[i].isValid) {
			return mediaQueries[i]
		}
	}
	return null // No valid object found
}
