import { getAvatarFallback } from '~/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

interface UserAvatarProps {
	src: string | undefined
	alt: string
	name: string
	className?: string
}

export function UserAvatar({ src, alt, name, className }: UserAvatarProps) {
	return (
		<Avatar className={className ? className : 'h-8 w-8 flex-shrink-0'}>
			<AvatarImage src={src} alt={alt ?? 'User Avatar'} />
			<AvatarFallback>{getAvatarFallback(name)}</AvatarFallback>
		</Avatar>
	)
}
