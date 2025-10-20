'use client'

import type { Session } from 'next-auth'
import { Toaster } from '~/components/base/sonner'
import { Footer } from '~/components/shared/layout/footer/footer'
import { Providers } from '~/components/shared/layout/providers'

import '~/app/css/globals.css'
import { Header } from '~/components/shared/layout/header/header'

export function LayoutContainer({
	children,
	session,
}: {
	children: React.ReactNode
	session: Session | null
}) {
	return (
		<Providers initSession={session}>
			<div className="flex relative flex-col min-h-screen">
				<Header />
				<main className="flex-1">{children}</main>
				<Toaster />
				<Footer />
			</div>
		</Providers>
	)
}
