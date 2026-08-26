import { createHash } from 'node:crypto'

export function hashSourcePayload(payload: unknown): string {
	return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}
