/** Module-level bridge dedupe state shared by `usePollarAuthBridge`. */
let bridgedPollarUserId: string | null = null

export const getBridgedPollarUserId = (): string | null => bridgedPollarUserId

export const setBridgedPollarUserId = (userId: string | null): void => {
	bridgedPollarUserId = userId
}

export const resetPollarAuthBridgeState = (): void => {
	bridgedPollarUserId = null
}
