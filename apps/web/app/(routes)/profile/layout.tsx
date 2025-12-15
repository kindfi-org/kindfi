export default async function ProfileLayout({
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
			</div>
		</div>
	)
}
