import { cn } from '~/lib/utils'

type TitleCardDetailProps = {
	children: React.ReactNode
	className?: string
}
export function TitleCardDetail({ children, className }: TitleCardDetailProps) {
	return (
		<h3 className={cn('font-bold text-gray-900 text-xl', className)}>
			{children}
		</h3>
	)
}
