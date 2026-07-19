import { describe, expect, test } from 'bun:test'
import { Buffer } from 'node:buffer'
import { argsToScVals } from '../src/stellar/passkey-transaction.utils'

describe('argsToScVals', () => {
	test('converts a string to scvString', () => {
		const [val] = argsToScVals(['hello'])
		expect(val.switch().name).toBe('scvString')
		expect(val.str().toString()).toBe('hello')
	})

	test('converts a number to scvU64', () => {
		const [val] = argsToScVals([42])
		expect(val.switch().name).toBe('scvU64')
		expect(val.u64().toString()).toBe('42')
	})

	test('converts a boolean to scvBool', () => {
		const [val] = argsToScVals([true])
		expect(val.switch().name).toBe('scvBool')
		expect(val.b()).toBe(true)
	})

	test('converts an object to scvBytes with JSON payload', () => {
		const obj = { foo: 'bar' }
		const [val] = argsToScVals([obj])
		expect(val.switch().name).toBe('scvBytes')
		expect(Buffer.from(val.bytes()).toString('utf-8')).toBe(JSON.stringify(obj))
	})

	test('preserves order and length across mixed args', () => {
		const vals = argsToScVals(['a', 1, false])
		expect(vals).toHaveLength(3)
		expect(vals[0].switch().name).toBe('scvString')
		expect(vals[1].switch().name).toBe('scvU64')
		expect(vals[2].switch().name).toBe('scvBool')
	})

	test('returns an empty array for no args', () => {
		expect(argsToScVals([])).toEqual([])
	})
})
