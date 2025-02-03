export enum ErrorCode {
	NO_MATCHING_RP_ID = 'NO_MATCHING_RP_ID',
	CHALLENGE_NOT_FOUND = 'CHALLENGE_NOT_FOUND',
	AUTHENTICATOR_NOT_REGISTERED = 'AUTHENTICATOR_NOT_REGISTERED',
	UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	[ErrorCode.NO_MATCHING_RP_ID]: 'No matching RP_ID found for origin.',
	[ErrorCode.CHALLENGE_NOT_FOUND]: 'Challenge not found.',
	[ErrorCode.AUTHENTICATOR_NOT_REGISTERED]:
		'Authenticator is not registered with this site.',
	[ErrorCode.UNEXPECTED_ERROR]: 'An unexpected error occurred.',
}

export class InAppError extends Error {
	code: ErrorCode
	constructor(code: ErrorCode, message?: string) {
		super(message || ERROR_MESSAGES[code])
		this.name = 'InAppError'
		this.code = code
	}
}
