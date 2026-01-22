'use client'

import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'

type Role = Database['public']['Enums']['user_role']

interface ProfileHeaderProps {
	displayName: string
	email: string
	imageUrl: string | null
	role: Role
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

	const roleLabel = role === 'kindler' ? 'Creator' : 'Donor'

	return (
		<Card className="border-0 overflow-hidden relative bg-card shadow-xl">
			{/* Animated background shapes */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
				<div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
			</div>

			<CardContent className="p-6 relative z-10">
				<div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
					<motion.div
						whileHover={{ scale: 1.05, rotate: 2 }}
						transition={{ type: 'spring', stiffness: 300 }}
					>
						<Avatar className="h-32 w-32 border-4 border-background shadow-2xl ring-4 ring-primary/20">
							<AvatarImage src={imageUrl || undefined} alt={displayName} />
							<AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
								{getAvatarFallback(displayName)}
							</AvatarFallback>
						</Avatar>
					</motion.div>
					<div className="flex-1 space-y-3">
						<div className="flex flex-col sm:flex-row sm:items-center gap-3">
							<motion.h1
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.2 }}
								className="text-4xl font-extrabold text-foreground"
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
									className="bg-primary text-primary-foreground border-0 font-bold text-sm px-4 py-1.5 shadow-lg"
								>
									<Sparkles className="h-3 w-3 mr-1.5" />
									{roleLabel}
								</Badge>
							</motion.div>
						</div>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="text-muted-foreground font-medium"
						>
							{email}
						</motion.p>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="text-sm text-muted-foreground"
						>
							Member since{' '}
							{new Date(createdAt).toLocaleDateString('en-US', {
								month: 'long',
								year: 'numeric',
							})}
						</motion.p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
