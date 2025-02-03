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
	NETWORK_PASSPHRASE: z
		.string()
		.default('Test SDF Future Network ; October 2022'),
	FACTORY_CONTRACT_ID: z
		.string()
		.default('CCZWIOWKT4WGJQHWZFF7ARCQJFVWRXPOKG4WGY6DOZ72OHZEMKXAEGRO'),
	ACCOUNT_SECP256R1_CONTRACT_WASM: z
		.string()
		.default(
			'23d8e1fbdb0bb903815feb7d07b675db98b5376feedab056aab61910d41e80c1',
		),
	RPC_URL: z.string().default('https://rpc-futurenet.stellar.org'),
	HORIZON_URL: z.string().default('https://horizon-futurenet.stellar.org'),
})

type Env = z.infer<typeof envSchema>

let ENV: Env & { CHALLENGE_TTL_MS: number }

try {
	const parsed = envSchema.parse({
		...process.env,
	})
	ENV = {
		...parsed,
		CHALLENGE_TTL_MS: parsed.CHALLENGE_TTL_SECONDS * 1000,
	}
} catch (err) {
	if (err instanceof z.ZodError) {
		console.error(err.issues)
	}
	process.exit(1)
}

export { ENV }
