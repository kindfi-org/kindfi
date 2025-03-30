import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import { SidebarProvider, SidebarTrigger } from '~/components/base/sidebar'
import { Footer } from '~/components/shared/footer'
import { AppSidebar } from '~/components/shared/sidebar'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'KindFi Academy App',
	description: 'A web application for the KindFi Academy',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SidebarProvider>
					<AppSidebar />
					<main className="flex-1 p-4 pb-0">
						<SidebarTrigger className="mr-4" aria-label="Toggle sidebar" />
						{children}
						<Footer />
					</main>
				</SidebarProvider>
			</body>
		</html>
	)
}
