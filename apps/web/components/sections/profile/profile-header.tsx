'use client'

import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'

type Role = Database['public']['Enums']['user_role'] | null

interface ProfileHeaderProps {
	displayName: string
	email: string
	imageUrl: string | null
	role: Role | null
	createdAt: string
}

export function ProfileHeader({
	displayName,
	email,
	imageUrl,
	role,
	createdAt,
}: ProfileHeaderProps) {
	const getAvatarFallback = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	const roleLabel =
		role === 'creator'
			? 'Creator'
			: role === 'donor'
				? 'Donor'
				: role === 'admin'
					? 'Admin'
					: 'Select Role'

	return (
		<Card className="border border-[#000124]/10 overflow-hidden relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl shadow-2xl shadow-[#000124]/10 hover:shadow-[#000124]/15 transition-all duration-500">
			{/* Enhanced gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-[#000124]/8 via-[#000124]/3 to-transparent pointer-events-none" />

			{/* Animated background shapes with enhanced effects */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-[#000124]/12 to-[#000124]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
				<div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#000124]/8 to-[#000124]/3 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#000124]/5 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
			</div>

			<CardContent className="p-8 lg:p-10 relative z-10">
				<div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
					<motion.div
						whileHover={{ scale: 1.05 }}
						transition={{ type: 'spring', stiffness: 400, damping: 25 }}
						className="relative"
					>
						<div className="absolute inset-0 bg-gradient-to-br from-[#000124]/30 via-[#000124]/15 to-transparent rounded-full blur-2xl animate-pulse" />
						<div className="absolute inset-0 bg-gradient-to-br from-[#000124]/20 to-transparent rounded-full blur-xl" />
						<Avatar className="relative h-28 w-28 lg:h-36 lg:w-36 border-4 border-background/80 shadow-2xl ring-4 ring-[#000124]/15 hover:ring-[#000124]/25 transition-all duration-300">
							<AvatarImage src={imageUrl || undefined} alt={displayName} />
							<AvatarFallback className="text-2xl lg:text-3xl font-bold bg-gradient-to-br from-[#000124] via-[#000124]/90 to-[#000124]/80 text-white shadow-inner">
								{getAvatarFallback(displayName)}
							</AvatarFallback>
						</Avatar>
					</motion.div>
					<div className="flex-1 space-y-4 min-w-0">
						<div className="flex flex-col sm:flex-row sm:items-center gap-4">
							<motion.h1
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.2 }}
								className="text-3xl lg:text-5xl font-extrabold text-foreground tracking-tight"
							>
								{displayName}
							</motion.h1>
							<motion.div
								initial={{ opacity: 0, scale: 0 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.3, type: 'spring' }}
							>
								<Badge
									variant="outline"
									className="bg-gradient-to-r from-[#000124] to-[#000124]/90 text-white border-0 font-bold text-xs lg:text-sm px-5 py-2.5 shadow-xl hover:shadow-2xl transition-all ring-2 ring-[#000124]/20 hover:ring-[#000124]/40"
								>
									<Sparkles className="h-3.5 w-3.5 mr-1.5" />
									{roleLabel}
								</Badge>
							</motion.div>
						</div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="space-y-2"
						>
							<p className="text-base lg:text-lg text-muted-foreground font-medium flex items-center gap-2">
								{email}
							</p>
							<p className="text-sm text-muted-foreground/80">
								Member since{' '}
								<span className="font-medium">
									{new Date(createdAt).toLocaleDateString('en-US', {
										month: 'long',
										year: 'numeric',
									})}
								</span>
							</p>
						</motion.div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
