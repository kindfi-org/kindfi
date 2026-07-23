'use client'

import { useSyncExternalStore } from 'react'

/** True only in the browser — safe for SSR/hydration gates. */
export const useIsClient = (): boolean =>
	useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	)
