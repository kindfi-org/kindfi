'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { type ReactNode, useState } from 'react'
import { cn } from '~/lib/utils'

interface ProjectHeroBannerProps {
	src: string | null | undefined
	alt: string
	className?: string
	children?: ReactNode
}

function HeroImageOverlays() {
	return (
		<>
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(15,23,42,0.45)_100%)]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/40 to-transparent"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-black/65 via-black/25 to-transparent"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-300/50 to-transparent"
				aria-hidden="true"
			/>
		</>
	)
}

function HeroImagePlaceholder({ alt }: { alt: string }) {
	return (
		<div
			className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-900 via-slate-800 to-slate-900"
			role="img"
			aria-label={alt}
		>
			<div
				className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.16)_1px,transparent_0)] bg-size-[24px_24px] opacity-30"
				aria-hidden="true"
			/>
			<div
				className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl"
				aria-hidden="true"
			/>
			<div
				className="absolute -right-10 bottom-4 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl"
				aria-hidden="true"
			/>
			<div className="relative flex flex-col items-center gap-3 text-white/70">
				<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
					<ImageIcon className="h-7 w-7" aria-hidden="true" />
				</div>
				<p className="max-w-xs px-6 text-center text-sm font-medium text-white/80">{alt}</p>
			</div>
		</div>
	)
}

export function ProjectHeroBanner({ src, alt, className, children }: ProjectHeroBannerProps) {
	const reducedMotion = useReducedMotion()
	const [hasError, setHasError] = useState(false)

	const imageSrc = src?.trim() && !hasError ? src.trim() : null
	const showImage = Boolean(imageSrc)

	return (
		<div
			className={cn(
				'relative h-96 w-full overflow-hidden bg-slate-900 sm:h-112 md:h-128 lg:h-144',
				className,
			)}
		>
			{showImage && imageSrc ? (
				<>
					<Image
						src={imageSrc}
						alt=""
						aria-hidden="true"
						fill
						className="scale-110 object-cover object-[center_38%] blur-2xl brightness-75 saturate-125"
						sizes="(max-width: 1024px) 100vw, 66vw"
						quality={40}
						priority
						onError={() => setHasError(true)}
					/>

					<motion.div
						className="absolute inset-0"
						initial={reducedMotion ? false : { scale: 1.06, opacity: 0.92 }}
						animate={reducedMotion ? false : { scale: 1, opacity: 1 }}
						transition={
							reducedMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
						}
					>
						<Image
							src={imageSrc}
							alt={alt}
							fill
							className="object-cover object-[center_38%]"
							sizes="(max-width: 1024px) 100vw, 66vw"
							quality={90}
							priority
							onError={() => setHasError(true)}
						/>
					</motion.div>
				</>
			) : (
				<HeroImagePlaceholder alt={alt} />
			)}

			<HeroImageOverlays />

			{children ? (
				<div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 md:p-6">
					{children}
				</div>
			) : null}
		</div>
	)
}
