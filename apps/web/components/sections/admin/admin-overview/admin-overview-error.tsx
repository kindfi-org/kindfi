export function AdminOverviewError() {
	return (
		<div className="text-center py-12" role="alert">
			<p className="text-destructive font-medium">Error loading admin stats.</p>
			<p className="text-muted-foreground mt-1 text-sm">
				Refresh the page or try again later. If it continues, check your connection.
			</p>
		</div>
	)
}
