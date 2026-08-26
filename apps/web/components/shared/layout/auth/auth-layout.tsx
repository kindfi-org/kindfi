import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'

interface AuthLayoutProps {
	children: React.ReactNode
	backgroundImage?: string
	/** Optional content over the branding image on large screens */
	aside?: ReactNode
	contentMaxWidth?: 'md' | 'lg'
}

export const AuthLayout = ({
	children,
	backgroundImage,
	aside,
	contentMaxWidth = 'md',
}: AuthLayoutProps) => {
	const imageUrl = backgroundImage || '/auth-background.jpg'

	return (
		<div className="flex min-h-screen">
			<div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2">
				<div className={cn('w-full', contentMaxWidth === 'lg' ? 'max-w-lg' : 'max-w-md')}>
					{children}
				</div>
			</div>

			<div className="relative hidden lg:block lg:w-1/2">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: `url(${imageUrl})` }}
				>
					<div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm">
						<div className="flex h-full items-center justify-center p-8 text-white">
							{aside ? (
								<div className="w-full max-w-md">{aside}</div>
							) : (
								<div className="flex flex-col items-center justify-center">
									<h2 className="mb-4 text-3xl font-bold">Make an Impact with Web3</h2>
									<p className="max-w-md text-center text-lg">
										Join the first blockchain-powered social impact platform in Latin America
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
