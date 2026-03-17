import { z } from 'zod'

/** Minimal WebAuthn authentication response structure (validated by @simplewebauthn/server) */
const authenticationResponseSchema = z
	.object({
		id: z.string().min(1, 'Credential ID is required'),
		rawId: z.string(),
		response: z.object({
			clientDataJSON: z.string(),
			authenticatorData: z.string(),
			signature: z.string(),
			userHandle: z
				.string()
				.optional()
				.nullable()
				.transform((v) => (v === null ? undefined : v)),
		}),
		type: z.literal('public-key'),
		clientExtensionResults: z.record(z.unknown()).default({}),
	})
	.passthrough()

/** Minimal WebAuthn registration response structure (validated by @simplewebauthn/server) */
const registrationResponseSchema = z
	.object({
		id: z.string().min(1, 'Credential ID is required'),
		rawId: z.string(),
		response: z
			.object({
				attestationObject: z.string(),
				clientDataJSON: z.string(),
				transports: z.array(z.string()).optional(),
			})
			.passthrough(),
		type: z.literal('public-key'),
		clientExtensionResults: z.record(z.unknown()).default({}),
	})
	.passthrough()

export const generateAuthOptionsSchema = z.object({
	identifier: z.string().min(1, 'Identifier is required'),
	origin: z.string().url('Invalid origin URL'),
	userId: z.string().uuid('Invalid user ID').optional(),
})

export const generateRegistrationOptionsSchema = z.object({
	identifier: z.string().min(1, 'Identifier is required'),
	origin: z.string().url('Invalid origin URL'),
	userId: z.string().uuid('Invalid user ID').optional(),
})

export const verifyAuthSchema = z.object({
	identifier: z.string().min(1, 'Identifier is required'),
	origin: z.string().url('Invalid origin URL'),
	authenticationResponse: authenticationResponseSchema,
	userId: z.string().uuid('Invalid user ID').optional(),
})

export const verifyRegistrationSchema = z.object({
	identifier: z.string().min(1, 'Identifier is required'),
	origin: z.string().url('Invalid origin URL'),
	registrationResponse: registrationResponseSchema,
	userId: z.string().uuid('Invalid user ID').optional(),
})
