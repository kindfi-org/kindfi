import { RightPanel } from '~/components/sections/user/right-panel'

export function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-1 flex flex-col-reverse md:flex-row">
				<main className="flex-1 w-full md:w-[calc(100%-340px)]">
					{children}
				</main>
				<aside className="w-full md:w-[340px] md:flex-shrink-0">
					<div className="h-full sticky top-0">
						<RightPanel />
					</div>
				</aside>
			</div>
		</div>
	)
}
