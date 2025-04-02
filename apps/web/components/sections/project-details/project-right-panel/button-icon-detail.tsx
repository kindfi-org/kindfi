import { Button } from '~/components/base/button'

export function ButtonIconDetail({ children }: { children: React.ReactNode }) {
	return (
		<Button
			className="rounded-full hover:bg-gray-100 text-gray-900 flex-shrink-0"
			size="icon"
		>
			{children}
		</Button>
	)
}
