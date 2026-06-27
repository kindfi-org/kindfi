const ALLOWED_PATH_PREFIXES = ['deployer/', 'escrow/', 'helper/', 'indexer/'] as const

/** Read-only helper routes used on public project pages (no session required). */
export const TRUSTLESS_WORK_PUBLIC_GET_PATHS = new Set([
	'helper/get-multiple-escrow-balance',
	'helper/get-escrow-by-contract-ids',
	'helper/get-escrows-by-signer',
	'helper/get-escrows-by-role',
])

export const isAllowedTrustlessWorkPath = (path: string): boolean =>
	ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))

export const isPublicTrustlessWorkRead = (method: string, path: string): boolean =>
	method === 'GET' && TRUSTLESS_WORK_PUBLIC_GET_PATHS.has(path)

export const requiresTrustlessWorkAuth = (method: string, path: string): boolean =>
	!isPublicTrustlessWorkRead(method, path)
