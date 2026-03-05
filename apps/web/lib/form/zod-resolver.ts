import type { FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

/**
 * Zod v4-compatible resolver for react-hook-form.
 * @hookform/resolvers zodResolver expects Zod v3 types and fails with Zod v4
 * (e.g. ZodObject<..., $strip>, _zod.version.minor mismatch).
 * This resolver uses safeParse and maps Zod v4 issues to react-hook-form FieldErrors.
 *
 * Use the generic to specify the form type when it differs from schema inference
 * (e.g. zodResolver<CreateProjectFormData>(schema)).
 */
export function zodResolver<TFieldValues extends FieldValues>(
	schema: z.ZodType<unknown>,
): Resolver<TFieldValues> {
	const resolver = async (values: unknown) => {
		const result = schema.safeParse(values)

		if (result.success) {
			return { values: result.data as TFieldValues, errors: {} }
		}

		const fieldErrors: Record<string, { type: string; message: string }> = {}
		for (const issue of result.error.issues) {
			const path = issue.path.join('.')
			if (!fieldErrors[path]) {
				fieldErrors[path] = {
					type: issue.code,
					message: issue.message,
				}
			}
		}

		return { values: {} as TFieldValues, errors: fieldErrors }
	}
	return resolver as unknown as Resolver<TFieldValues>
}
