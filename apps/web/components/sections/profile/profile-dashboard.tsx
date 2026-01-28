'use client'

import type { Database } from '@services/supabase'
import { AnimatePresence, motion } from 'framer-motion'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
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
import { WalletCard } from './cards/wallet-card'
import { RoleSelectionModal } from './modals/role-selection-modal'
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
			role: Role | null
			display_name: string | null
			bio: string | null
			image_url: string | null
			slug?: string | null
		} | null
	}
	smartAccountAddress?: string | null
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
	smartAccountAddress,
	defaultTab = 'overview',
	kycCompleted = false,
}: ProfileDashboardProps) {
	const role: Role | null = user.profile?.role ?? null
	const displayName = useMemo(
		() => user.profile?.display_name || user.email?.split('@')[0] || 'You',
		[user.profile?.display_name, user.email],
	)
	const { address: externalWalletAddress, connect, isConnected } = useWallet()
	const imageUrl = user.profile?.image_url ?? null
	const [showRoleModal, setShowRoleModal] = useState(false)

	// Check if user needs to select role (show modal if role is pending or they haven't chosen)
	useEffect(() => {
		// Show modal if user's role is 'pending' or null (unselected)
		if (role === 'pending' || role === null) {
			// Use startTransition to avoid synchronous setState in effect
			startTransition(() => {
				setShowRoleModal(true)
			})
		}
	}, [role])

	const handleRoleSelected = () => {
		// Mark that user has chosen their role
		localStorage.setItem('kindfi_role_chosen', 'true')
		setShowRoleModal(false)
	}

	// Show success message if user just completed KYC and trigger status refresh
	useEffect(() => {
		if (kycCompleted) {
			const kycUpdateErrorMessage =
				'Failed to update KYC status. Please refresh to retry.'
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
							// Clean URL params only after successful API update
							window.history.replaceState({}, '', '/profile')
							// Reload page to show updated status (server already updated database)
							window.location.reload()
						} else {
							toast.error(kycUpdateErrorMessage)
						}
					})
					.catch(() => {
						toast.error(kycUpdateErrorMessage)
					})
			} else {
				toast.info('KYC verification completed! Checking your status...')
			}
		}
	}, [kycCompleted])

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative">
			{/* Subtle background pattern */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,1,36,0.03)_1px,transparent_0)] bg-[size:32px_32px] opacity-40" />

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="show"
				className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl space-y-8 lg:space-y-12 relative z-10"
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

				{/* Quick Stats Cards - Balanced Layout */}
				<motion.div
					variants={staggerContainer}
					initial="initial"
					animate="animate"
					className="grid gap-6 md:grid-cols-3 md:gap-6 lg:gap-8"
				>
					{/* Wallet Card - Takes 2 columns on desktop, full width on mobile */}
					<motion.div variants={itemVariants} className="md:col-span-2 flex">
						<WalletCard
							smartAccountAddress={smartAccountAddress ?? null}
							externalWalletAddress={externalWalletAddress}
							isExternalConnected={isConnected}
							onConnectExternal={connect}
						/>
					</motion.div>
					{/* KYC Card - Takes 1 column on desktop, full width on mobile */}
					<motion.div variants={itemVariants} className="flex">
						<KYCCard userId={user.id} shouldRefresh={kycCompleted} />
					</motion.div>
				</motion.div>

				{/* Main Content Tabs */}
				<motion.div variants={itemVariants}>
					<Tabs defaultValue={defaultTab} className="space-y-8">
						<TabsList className="inline-flex h-auto items-center justify-center gap-1 bg-transparent p-0 w-full sm:w-auto border-b border-gray-200">
							<TabsTrigger
								value="overview"
								className="data-[state=active]:text-[#000124] data-[state=active]:border-b-[3px] data-[state=active]:border-[#000124] data-[state=active]:font-bold data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent data-[state=inactive]:font-medium transition-all duration-200 rounded-none px-6 py-3 text-base -mb-px"
							>
								Overview
							</TabsTrigger>
							<TabsTrigger
								value="settings"
								className="data-[state=active]:text-[#000124] data-[state=active]:border-b-[3px] data-[state=active]:border-[#000124] data-[state=active]:font-bold data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent data-[state=inactive]:font-medium transition-all duration-200 rounded-none px-6 py-3 text-base -mb-px"
							>
								Settings
							</TabsTrigger>
						</TabsList>

						<AnimatePresence mode="wait">
							<TabsContent value="overview" className="space-y-8 mt-8">
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3, ease: 'easeOut' }}
								>
									{role === 'creator' ? (
										<CreatorProfile
											userId={user.id}
											displayName={displayName}
										/>
									) : role === 'donor' ? (
										<DonorProfile userId={user.id} displayName={displayName} />
									) : (
										// Show donor profile as fallback for pending/admin roles
										<DonorProfile userId={user.id} displayName={displayName} />
									)}
								</motion.div>
							</TabsContent>

							<TabsContent value="settings" className="space-y-8 mt-8">
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3, ease: 'easeOut' }}
									className="grid gap-6 lg:gap-8 md:grid-cols-2"
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

				{/* Role Selection Modal */}
				<RoleSelectionModal
					open={showRoleModal}
					onOpenChange={setShowRoleModal}
					userId={user.id}
					currentRole={role}
					onRoleSelected={handleRoleSelected}
				/>
			</motion.div>
		</div>
	)
}
