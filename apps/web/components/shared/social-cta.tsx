import { Button } from '../base/button'

interface SocialButtonProps {
	icon: React.ReactNode
	provider: string
	className: string
	onClick: () => void
}

export const SocialButton = ({
	icon,
	provider,
	onClick,
}: SocialButtonProps) => (
	<Button
		variant="outline"
		className="w-full flex items-center gap-2 mb-3"
		onClick={onClick}
		aria-label={`Continue with ${provider}`}
	>
		{icon}
		<span>Continuar con {provider}</span>
	</Button>
)
