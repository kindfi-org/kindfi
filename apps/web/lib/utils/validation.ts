import { NextResponse } from 'next/server'
import type { ZodSchema } from 'zod'

/**
 * Validates request data against a Zod schema and returns either
 * the parsed data or a 400 NextResponse with validation details.
 */
export function validateRequest<T>(
	schema: ZodSchema<T>,
	data: unknown,
): { success: true; data: T } | { success: false; response: NextResponse } {
	const result = schema.safeParse(data)

	if (!result.success) {
		return {
			success: false,
			response: NextResponse.json(
				{
					error: 'Validation failed',
					details: result.error.format(),
				},
				{ status: 400 },
			),
		}
	}

	return { success: true, data: result.data }
}
