import React from 'react'
import type { ComponentType } from 'react'
import { Text } from '../Themed'
import { Box } from '../ui/box'
import { Icon } from '../ui/icon'
import { Link } from '../ui/link'

type ImpactCardProps = {
	icon: ComponentType<{ size?: number; color?: string }>
	title: string
	description: string
	linkText: string
	linkHref: string
	iconColor?: string // Optional, default will be success-400
}

export default function ImpactCard({
	icon,
	title,
	description,
	linkText,
	linkHref,
	iconColor = 'success-400',
}: ImpactCardProps) {
	return (
		<Box className="rounded-md h-[250px] w-[95%] justify-between gap-6 bg-white dark:bg-black shadow-background-light p-5 shadow-md">
			{/* Icon Wrapper */}
			<Box
				className={`rounded-full bg-${iconColor}/10  w-10 h-10 items-center justify-center`}
			>
				<Icon
					as={icon}
					height={24}
					width={24}
					className={`text-${iconColor} z-10`}
				/>
			</Box>

			{/* Content */}
			<Box className="gap-4">
				<Text className="font-bold capitalize text-xl text-start">{title}</Text>
				<Text className="text-base text-typography-white font-normal text-left">
					{description}
				</Text>
			</Box>

			{/* Link */}
			<Link href={linkHref} className="">
				<Text style={{ color: 'blue' }} className="text-sm">
					{linkText}
				</Text>
			</Link>
		</Box>
	)
}
