import { z } from 'zod'

const envSchema = z.object({
	REDIS_URL: z.string().default(''),
	RP_ID: z
		.string()
		.transform((val) => {
			try {
				return JSON.parse(val) as string[]
			} catch {
				throw new Error('Invalid RP_ID format. Expected a JSON array string.')
			}
		})
		.default('["localhost"]'),
	RP_NAME: z
		.string()
		.transform((val) => {
			try {
				return JSON.parse(val) as string[]
			} catch {
				throw new Error('Invalid RP_NAME format. Expected a JSON array string.')
			}
		})
		.default('["App"]'),
	EXPECTED_ORIGIN: z
		.string()
		.transform((val) => {
			try {
				return JSON.parse(val) as string[]
			} catch {
				throw new Error(
					'Invalid EXPECTED_ORIGIN format. Expected a JSON array string.',
				)
			}
		})
		.default('["http://localhost:3000"]'),
	CHALLENGE_TTL_SECONDS: z.coerce.number().default(60),
})

type Env = z.infer<typeof envSchema>

let ENV_PASSKEY: Env & { CHALLENGE_TTL_MS: number }

try {
	const parsed = envSchema.parse({
		...process.env,
	})
	ENV_PASSKEY = {
		...parsed,
		CHALLENGE_TTL_MS: parsed.CHALLENGE_TTL_SECONDS * 1000,
	}
} catch (err) {
	if (err instanceof z.ZodError) {
		console.error(err.issues)
	}
	process.exit(1)
}

export { ENV_PASSKEY }
