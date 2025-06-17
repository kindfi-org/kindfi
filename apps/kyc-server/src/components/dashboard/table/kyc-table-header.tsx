import type { HeaderGroup } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

import { TableHead, TableHeader, TableRow } from '~/components/base/table'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycTableHeaderProps {
	headerGroups: HeaderGroup<KycRecord>[]
}

export function KycTableHeader({ headerGroups }: KycTableHeaderProps) {
	return (
		<TableHeader className="sticky top-0 z-10 bg-muted">
			{headerGroups.map((headerGroup) => (
				<TableRow key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						return (
							<TableHead key={header.id} colSpan={header.colSpan}>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
							</TableHead>
						)
					})}
				</TableRow>
			))}
		</TableHeader>
	)
}
