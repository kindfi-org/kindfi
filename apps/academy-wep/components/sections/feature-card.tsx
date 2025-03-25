import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type React from 'react'
import { useRef, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'

interface FeatureCardProps {
	icon: React.ReactNode
	title: string
	titleHighlight: string
	titleColor: 'green' | 'blue' | 'purple'
	description: string
	ctaText: string
	ctaLink: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
	icon,
	title,
	titleHighlight,
	titleColor,
	description,
	ctaText,
	ctaLink,
}) => {
	const cardRef = useRef<HTMLDivElement>(null)
	const [isHovering, setIsHovering] = useState(false)
	const defaultPosition = { x: 0.5, y: 0.25 }
	const [position, setPosition] = useState(defaultPosition)

	const colorMap = {
		green: {
			text: 'text-green-600',
			hover: 'hover:text-green-700',
			rgb: '144, 238, 144',
			iconBg: 'rgba(235, 246, 235, 0.9)', 
		},
		blue: {
			text: 'text-blue-600',
			hover: 'hover:text-blue-700',
			rgb: '173, 216, 230',
			iconBg: 'rgba(235, 242, 255, 0.9)', 
		},
		purple: {
			text: 'text-purple-600',
			hover: 'hover:text-purple-700',
			rgb: '221, 160, 221',
			iconBg: 'rgba(245, 235, 250, 0.9)', 
		},
	}

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return
		const rect = cardRef.current.getBoundingClientRect()
		const x = (e.clientX - rect.left) / rect.width
		const y = (e.clientY - rect.top) / rect.height
		if (isHovering) {
			setPosition({ x, y })
		}
	}

	const handleMouseEnter = () => {
		setIsHovering(true)
	}

	const handleMouseLeave = () => {
		setIsHovering(false)
		setPosition(defaultPosition)
	}

	return (
		<Card
			ref={cardRef}
			className="relative overflow-hidden bg-white rounded-xl shadow-lg transition-all duration-300 h-full"
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div
				className="absolute inset-0 pointer-events-none transition-all duration-300"
				style={{
					opacity: isHovering ? 0.3 : 0.15,
					background: `radial-gradient(220px circle at ${position.x * 100}% ${position.y * 100}%, rgba(${colorMap[titleColor].rgb}, 1), transparent 70%)`,
				}}
			/>
			<CardHeader className="flex items-center justify-center pt-8 pb-2 relative z-10">
				<div className="relative">
					<div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-md">
						<div
							className="w-20 h-20 rounded-full flex items-center justify-center"
							style={{
								backgroundColor: colorMap[titleColor].iconBg,
							}}
						>
							<div
								style={{
									color:
										titleColor === 'green'
											? '#8BC34A'
											: titleColor === 'blue'
												? '#2196F3'
												: '#9C27B0',
								}}
							>
								{icon}
							</div>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="text-center px-6 relative z-10">
				<h3 className="text-2xl font-semibold mb-3">
					<span className="text-gray-800">{title} </span>
					<span className={colorMap[titleColor].text}>{titleHighlight}</span>
				</h3>
				<p className="text-gray-600 mb-6">{description}</p>
			</CardContent>

			<CardFooter className="flex justify-center pb-8 relative z-10">
				<Button
					variant="ghost"
					className={`group ${colorMap[titleColor].text} ${colorMap[titleColor].hover}`}
					asChild
				>
					<a href={ctaLink}>
						{ctaText}
						<FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
					</a>
				</Button>
			</CardFooter>
		</Card>
	)
}
