'use client'

import { serverValue } from './server-only'

export default function Page() {
	return <main>{serverValue}</main>
}
