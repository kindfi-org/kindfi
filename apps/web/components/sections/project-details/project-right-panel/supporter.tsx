import { User } from 'lucide-react'
import { cn } from '~/lib/utils'

export function Supporter({ offSet }: { offSet?: string }) {
	return (
		<div
			className={cn(
				'inline-flex items-center p-1 bg-gray-100 rounded-full border-2 border-white',
				offSet,
			)}
		>
			<User className="size-5" />
		</div>
	)
}
