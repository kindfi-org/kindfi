import { describe, expect, test } from 'bun:test'
import {
	formatHumanPlatformFee,
	fromTrustlessWorkPlatformFee,
	getKindfiTrustlessWorkPlatformFee,
	KINDFI_PLATFORM_FEE_PERCENT,
	KINDFI_TRUSTLESS_WORK_PLATFORM_FEE,
	toTrustlessWorkPlatformFee,
} from './platform-fee'

describe('platform-fee', () => {
	test('KindFi platform fee is fixed at 1%', () => {
		expect(KINDFI_PLATFORM_FEE_PERCENT).toBe(1)
		expect(KINDFI_TRUSTLESS_WORK_PLATFORM_FEE).toBe(100)
		expect(getKindfiTrustlessWorkPlatformFee()).toBe(100)
	})

	test('converts human percent to Trustless Work centi-percent', () => {
		expect(toTrustlessWorkPlatformFee(0.6)).toBe(60)
		expect(toTrustlessWorkPlatformFee(1)).toBe(100)
	})

	test('converts Trustless Work centi-percent to human percent', () => {
		expect(fromTrustlessWorkPlatformFee(60)).toBe(0.6)
		expect(fromTrustlessWorkPlatformFee(100)).toBe(1)
	})

	test('formats human percent for display', () => {
		expect(formatHumanPlatformFee(0.6)).toBe('0.6%')
		expect(formatHumanPlatformFee(1)).toBe('1%')
		expect(formatHumanPlatformFee(2.5)).toBe('2.5%')
	})
})
