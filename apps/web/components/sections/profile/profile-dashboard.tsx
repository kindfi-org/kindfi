'use client'

import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useSearchParams } from 'next/navigation'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { KYCCard } from './cards/kyc-card'
import { PersonalInfoCard } from './cards/personal-info-card'
import { AccountInfoCard } from './cards/account-info-card'
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

/** Shared class for all profile-level tab triggers */
const tabTriggerClass = [
	'data-[state=active]:text-foreground',
	'data-[state=active]:border-b-2',
	'data-[state=active]:border-foreground',
	'data-[state=active]:font-semibold',
	'data-[state=inactive]:text-muted-foreground',
	'data-[state=inactive]:hover:text-foreground/80',
	'data-[state=inactive]:border-b',
	'data-[state=inactive]:border-transparent',
	'transition-colors duration-150',
	'rounded-none px-4 py-2.5 text-sm -mb-px whitespace-nowrap',
].join(' ')

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
	const { address: externalWalletAddress, connect, disconnect, isConnected } =
		useWallet()
	const imageUrl = user.profile?.image_url ?? null
	const [showRoleModal, setShowRoleModal] = useState(false)
	const searchParams = useSearchParams()
	const activeSection = searchParams?.get('section') || defaultTab

	// Show role selection if role is pending or null
	useEffect(() => {
		if (role === 'pending' || role === null) {
			startTransition(() => {
				setShowRoleModal(true)
			})
		}
	}, [role])

	const handleRoleSelected = () => {
		localStorage.setItem('kindfi_role_chosen', 'true')
		setShowRoleModal(false)
	}

	// Handle KYC callback
	useEffect(() => {
		if (!kycCompleted) return

		const urlParams = new URLSearchParams(window.location.search)
		const status = urlParams.get('status')
		const sessionId = urlParams.get('verificationSessionId')

		if (!status || !sessionId) {
			toast.info('KYC verification completed! Checking your status...')
			return
		}

		const normalizedStatus = status.replace(/\+/g, ' ')
		if (normalizedStatus === 'Approved') {
			toast.success('KYC verification approved! Your status is being updated...')
		} else if (normalizedStatus === 'Declined') {
			toast.error('KYC verification was declined. Please review the requirements and try again.')
		} else if (normalizedStatus === 'In Review' || normalizedStatus === 'In Progress') {
			toast.info("KYC verification is under review. We will notify you once it's complete.")
		} else {
			toast.info('KYC verification completed! Checking your status...')
		}

		fetch('/api/kyc/didit/callback', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ verificationSessionId: sessionId, status: normalizedStatus }),
		})
			.then(async (res) => {
				if (res.ok) {
					const result = await res.json()
					if (result.status === 'approved' || result.status === 'verified') {
						toast.success('KYC verification approved! Your status has been updated.')
					} else if (result.status === 'rejected') {
						toast.error('KYC verification was declined.')
					} else if (result.status === 'pending') {
						toast.info("KYC verification is under review.")
					}
					window.history.replaceState({}, '', '/profile')
					window.location.reload()
				} else {
					toast.error('Failed to update KYC status. Please refresh to retry.')
				}
			})
			.catch(() => {
				toast.error('Failed to update KYC status. Please refresh to retry.')
			})
	}, [kycCompleted])

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams?.toString() || '')
		params.set('section', value)
		window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
	}

	/** Renders the correct profile view for a given section */
	const renderSection = (section: string) => {
		const ProfileView = role === 'creator' ? CreatorProfile : DonorProfile
		return (
			<ProfileView
				userId={user.id}
				displayName={displayName}
				showSection={section as 'overview' | 'gamification' | 'donations' | 'nfts' | 'campaigns' | 'foundations'}
			/>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 max-w-6xl space-y-6">
				{/* Profile Header */}
				<ProfileHeader
					displayName={displayName}
					email={user.email}
					imageUrl={imageUrl}
					role={role}
					createdAt={user.created_at}
				/>

				{/* Wallet + KYC Row */}
				<div className="grid gap-5 md:grid-cols-3">
					<div className="md:col-span-2">
						<WalletCard
							smartAccountAddress={smartAccountAddress ?? null}
							externalWalletAddress={externalWalletAddress}
							isExternalConnected={isConnected}
							onConnectExternal={connect}
							onDisconnectExternal={disconnect}
						/>
					</div>
					<div>
						<KYCCard userId={user.id} shouldRefresh={kycCompleted} />
					</div>
				</div>

				{/* Main Content Tabs */}
				<Tabs
					value={activeSection}
					onValueChange={handleTabChange}
					className="space-y-6"
				>
					<TabsList className="inline-flex h-auto items-center gap-0.5 bg-transparent p-0 w-full border-b border-border overflow-x-auto">
						<TabsTrigger value="overview" className={tabTriggerClass}>
							Overview
						</TabsTrigger>
						<TabsTrigger value="gamification" className={tabTriggerClass}>
							Gamification
						</TabsTrigger>
						{role === 'donor' && (
							<TabsTrigger value="donations" className={tabTriggerClass}>
								Donations
							</TabsTrigger>
						)}
						{role === 'creator' && (
							<>
								<TabsTrigger value="campaigns" className={tabTriggerClass}>
									Campaigns
								</TabsTrigger>
								<TabsTrigger value="foundations" className={tabTriggerClass}>
									Foundations
								</TabsTrigger>
							</>
						)}
						<TabsTrigger value="settings" className={tabTriggerClass}>
							Settings
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="mt-6">
						<motion.div
							key="overview"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.2 }}
						>
							{renderSection('overview')}
						</motion.div>
					</TabsContent>

					<TabsContent value="gamification" className="mt-6">
						<motion.div
							key="gamification"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.2 }}
						>
							{renderSection('gamification')}
						</motion.div>
					</TabsContent>

					{role === 'donor' && (
						<TabsContent value="donations" className="mt-6">
							<motion.div
								key="donations"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.2 }}
							>
								{renderSection('donations')}
							</motion.div>
						</TabsContent>
					)}

					{role === 'creator' && (
						<>
							<TabsContent value="campaigns" className="mt-6">
								<motion.div
									key="campaigns"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.2 }}
								>
									{renderSection('campaigns')}
								</motion.div>
							</TabsContent>

							<TabsContent value="foundations" className="mt-6">
								<motion.div
									key="foundations"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.2 }}
								>
									{renderSection('foundations')}
								</motion.div>
							</TabsContent>
						</>
					)}

					<TabsContent value="settings" className="mt-6">
						<motion.div
							key="settings"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
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
				</Tabs>

				{/* Role Selection Modal */}
				<RoleSelectionModal
					open={showRoleModal}
					onOpenChange={setShowRoleModal}
					userId={user.id}
					currentRole={role}
					onRoleSelected={handleRoleSelected}
				/>
			</div>
		</div>
	)
}
