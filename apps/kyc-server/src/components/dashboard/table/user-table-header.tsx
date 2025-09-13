import type { HeaderGroup } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

import { TableHead, TableHeader, TableRow } from '~/components/base/table'

interface UserTableHeaderProps<TData> {
	headerGroups: HeaderGroup<TData>[]
}

export function UserTableHeader<TData>({
	headerGroups,
}: UserTableHeaderProps<TData>) {
	return (
		<TableHeader>
			{headerGroups.map((headerGroup) => (
				<TableRow key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						return (
							<TableHead key={header.id}>
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
