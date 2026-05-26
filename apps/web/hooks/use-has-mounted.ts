'use client'

import { useEffect, useState } from 'react'

/** True after the first client commit; false on server and during the first client render (matches SSR). */
export const useHasMounted = (): boolean => {
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	return mounted
}
