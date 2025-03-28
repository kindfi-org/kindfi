import { Button } from '~/components/base/button'

interface LoadMoreButtonProps {
	onClick: () => void
	label: string
}

export const LoadMoreButton = ({ onClick, label }: LoadMoreButtonProps) => {
	return (
		<Button
			onClick={onClick}
			variant="ghost"
			size="sm"
			className="text-black font-medium hover:underline"
		>
			{label}
		</Button>
	)
}
