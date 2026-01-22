'use client'

import type { Database } from '@services/supabase'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { staggerContainer } from '~/lib/constants/animations'
import { AccountInfoCard } from './cards/account-info-card'
import { KYCCard } from './cards/kyc-card'
import { PersonalInfoCard } from './cards/personal-info-card'
import { RoleCard } from './cards/role-card'
import { WalletCard } from './cards/wallet-card'
import { ProfileHeader } from './profile-header'
import { CreatorProfile } from './views/creator-profile'
import { DonorProfile } from './views/donor-profile'

type Role = Database['public']['Enums']['user_role']

interface ProfileDashboardProps {
	user: {
		id: string
		email: string
		created_at: string
		profile: {
			role: Role
			display_name: string | null
			bio: string | null
			image_url: string | null
			slug?: string | null
		} | null
	}
	defaultTab?: 'overview' | 'settings'
	kycCompleted?: boolean
}

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 15,
		},
	},
}

export function ProfileDashboard({
	user,
	defaultTab = 'overview',
	kycCompleted = false,
}: ProfileDashboardProps) {
	const role: Role = user.profile?.role ?? 'kinder'
	const displayName = useMemo(
		() => user.profile?.display_name || user.email?.split('@')[0] || 'You',
		[user.profile?.display_name, user.email],
	)
	const { address, connect, isConnected } = useWallet()
	const imageUrl = user.profile?.image_url ?? null

	// Show success message if user just completed KYC and trigger status refresh
	useEffect(() => {
		if (kycCompleted) {
			// Check URL params for status
			const urlParams = new URLSearchParams(window.location.search)
			const status = urlParams.get('status')
			const sessionId = urlParams.get('verificationSessionId')

			if (status && sessionId) {
				// Show appropriate message based on raw status from URL first
				// This gives immediate feedback before API call completes
				const normalizedStatus = status.replace(/\+/g, ' ') // Handle URL encoding
				if (normalizedStatus === 'Approved') {
					toast.success(
						'KYC verification approved! Your status is being updated...',
					)
				} else if (normalizedStatus === 'Declined') {
					toast.error(
						'KYC verification was declined. Please review the requirements and try again.',
					)
				} else if (
					normalizedStatus === 'In Review' ||
					normalizedStatus === 'In Progress'
				) {
					toast.info(
						"KYC verification is under review. We will notify you once it's complete.",
					)
				} else {
					toast.info('KYC verification completed! Checking your status...')
				}

				// Update status via API
				fetch('/api/kyc/didit/callback', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						verificationSessionId: sessionId,
						status: normalizedStatus,
					}),
				})
					.then(async (res) => {
						if (res.ok) {
							const result = await res.json()
							// Update toast with final status if different
							if (
								result.status === 'approved' ||
								result.status === 'verified'
							) {
								toast.success(
									'KYC verification approved! Your status has been updated.',
								)
							} else if (result.status === 'rejected') {
								toast.error(
									'KYC verification was declined. Please review the requirements and try again.',
								)
							} else if (result.status === 'pending') {
								toast.info(
									"KYC verification is under review. We will notify you once it's complete.",
								)
							}
							// Reload page to show updated status (server already updated database)
							window.location.reload()
						} else {
							console.error('Failed to update KYC status via API')
						}
					})
					.catch((error) => {
						console.error('Failed to update KYC status:', error)
					})

				// Remove query params from URL immediately
				window.history.replaceState({}, '', '/profile')
			} else {
				toast.info('KYC verification completed! Checking your status...')
			}
		}
	}, [kycCompleted])

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="show"
			className="container mx-auto px-4 py-6 space-y-6 max-w-7xl"
		>
			{/* Profile Header */}
			<motion.div variants={itemVariants}>
				<ProfileHeader
					displayName={displayName}
					email={user.email}
					imageUrl={imageUrl}
					role={role}
					createdAt={user.created_at}
				/>
			</motion.div>

			{/* Quick Stats Cards */}
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-4 md:grid-cols-3"
			>
				<motion.div variants={itemVariants} className="flex">
					<WalletCard
						address={address}
						isConnected={isConnected}
						onConnect={connect}
					/>
				</motion.div>
				<motion.div variants={itemVariants} className="flex">
					<KYCCard userId={user.id} shouldRefresh={kycCompleted} />
				</motion.div>
				<motion.div variants={itemVariants} className="flex">
					<RoleCard userId={user.id} currentRole={role} />
				</motion.div>
			</motion.div>

			{/* Main Content Tabs */}
			<motion.div variants={itemVariants}>
				<Tabs defaultValue={defaultTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex bg-muted p-1">
						<TabsTrigger
							value="overview"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
						>
							Overview
						</TabsTrigger>
						<TabsTrigger
							value="settings"
							className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
						>
							Settings
						</TabsTrigger>
					</TabsList>

					<AnimatePresence mode="wait">
						<TabsContent value="overview" className="space-y-6">
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.2 }}
							>
								{role === 'kindler' ? (
									<CreatorProfile userId={user.id} displayName={displayName} />
								) : (
									<DonorProfile userId={user.id} displayName={displayName} />
								)}
							</motion.div>
						</TabsContent>

						<TabsContent value="settings" className="space-y-6">
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.2 }}
								className="grid gap-6 md:grid-cols-2"
							>
								<PersonalInfoCard
									userId={user.id}
									displayName={user.profile?.display_name ?? ''}
									bio={user.profile?.bio ?? ''}
									imageUrl={user.profile?.image_url ?? ''}
									_email={user.email}
								/>
								<AccountInfoCard
									userEmail={user.email}
									createdAt={user.created_at}
									slug={user.profile?.slug ?? ''}
								/>
							</motion.div>
						</TabsContent>
					</AnimatePresence>
				</Tabs>
			</motion.div>
		</motion.div>
	)
}
