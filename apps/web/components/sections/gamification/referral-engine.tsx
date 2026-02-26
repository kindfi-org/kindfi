'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Copy, Gift, Share2, TrendingUp, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import { staggerContainer } from '~/lib/constants/animations'

interface Referral {
	id: string
	referrer_id: string
	referred_id: string
	status: 'pending' | 'onboarded' | 'first_donation' | 'active'
	created_at: string
	onboarded_at: string | null
	first_donation_at: string | null
	total_donations: number
}

interface ReferrerStats {
	total_referrals: number
	active_referrals: number
	total_reward_points: number
}

/**
 * Generate a deterministic, URL-safe referral code from a user ID.
 * Uses the first 8 hex chars of a simple hash so the code is short and stable.
 */
function buildReferralCode(userId: string): string {
	let hash = 0
	for (let i = 0; i < userId.length; i++) {
		hash = (hash * 31 + userId.charCodeAt(i)) | 0
	}
	// Use unsigned 32-bit hex + first chars of the UUID for uniqueness
	const hex = (hash >>> 0).toString(16).toUpperCase()
	const suffix = userId.replace(/-/g, '').slice(0, 4).toUpperCase()
	return `${hex}${suffix}`.slice(0, 8)
}

export function ReferralEngine() {
	const { data: session } = useSession()
	const [showShareDialog, setShowShareDialog] = useState(false)

	const { data, isLoading, error } = useQuery<{
		referrals: Referral[]
		statistics: ReferrerStats
		referred_by: string | null
	}>({
		queryKey: ['referrals'],
		queryFn: async () => {
			const response = await fetch('/api/referrals')
			if (!response.ok) {
				throw new Error('Failed to fetch referrals')
			}
			return response.json()
		},
		refetchInterval: 30000,
	})

	const referralCode = useMemo(
		() => (session?.user?.id ? buildReferralCode(session.user.id) : 'LOADING'),
		[session],
	)

	const handleCopyReferralCode = () => {
		navigator.clipboard.writeText(referralCode)
		toast.success('Referral code copied to clipboard!')
	}

	const handleShare = () => {
		const shareUrl = `${window.location.origin}/sign-up?ref=${referralCode}`
		navigator.clipboard.writeText(shareUrl)
		toast.success('Referral link copied to clipboard!')
		setShowShareDialog(false)
	}

	if (isLoading) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					Loading referral data...
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card className="border-red-200 bg-red-50">
				<CardContent className="py-12 text-center text-red-600">
					Error loading referrals. Please try again.
				</CardContent>
			</Card>
		)
	}

	const referrals = data?.referrals || []
	const stats = data?.statistics || {
		total_referrals: 0,
		active_referrals: 0,
		total_reward_points: 0,
	}
	const referredBy = data?.referred_by

	// Filter referrals by status for display (prepared for future UI features)
	const _pendingReferrals = referrals.filter((r) => r.status === 'pending')
	const _activeReferrals = referrals.filter(
		(r) => r.status === 'first_donation' || r.status === 'active',
	)

	return (
		<motion.div
			variants={staggerContainer}
			initial="initial"
			animate="animate"
			className="space-y-6"
		>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center justify-between"
			>
				<div>
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<Share2 className="h-6 w-6 text-primary" />
						Referral Program
					</h2>
					<p className="text-muted-foreground mt-1">
						Invite friends and earn rewards when they join and donate
					</p>
				</div>
			</motion.div>

			{/* Referral Code Card */}
			<Card className="bg-gradient-to-r from-primary/10 to-purple-50 border-primary/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Gift className="h-5 w-5 text-primary" />
						Your Referral Code
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-2">
						<code className="flex-1 px-4 py-3 bg-white rounded-lg border-2 border-primary/20 font-mono text-lg font-bold">
							{referralCode}
						</code>
						<Button
							onClick={handleCopyReferralCode}
							variant="outline"
							size="sm"
						>
							<Copy className="h-4 w-4 mr-2" />
							Copy
						</Button>
						<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
							<DialogTrigger asChild>
								<Button variant="default" size="sm">
									<Share2 className="h-4 w-4 mr-2" />
									Share
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Share Your Referral Link</DialogTitle>
									<DialogDescription>
										Copy your referral link and share it with friends
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<input
											type="text"
											readOnly
											value={`${window.location.origin}/sign-up?ref=${referralCode}`}
											className="flex-1 px-3 py-2 border rounded-lg"
										/>
										<Button onClick={handleShare} size="sm">
											<Copy className="h-4 w-4 mr-2" />
											Copy Link
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
					<div className="flex flex-wrap gap-2 text-sm">
						<Badge variant="outline" className="bg-white">
							+50 pts Onboarding
						</Badge>
						<Badge variant="outline" className="bg-white">
							+25 pts First Donation
						</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Statistics */}
			<div className="grid gap-4 md:grid-cols-3">
				<StatCard
					title="Total Referrals"
					value={stats.total_referrals}
					icon={Users}
					color="text-blue-600"
				/>
				<StatCard
					title="Active Referrals"
					value={stats.active_referrals}
					icon={TrendingUp}
					color="text-green-600"
				/>
				<StatCard
					title="Reward Points"
					value={stats.total_reward_points}
					icon={Gift}
					color="text-purple-600"
				/>
			</div>

			{/* Referred By */}
			{referredBy && (
				<Card className="bg-green-50 border-green-200">
					<CardContent className="py-4">
						<div className="flex items-center gap-2 text-sm">
							<Users className="h-4 w-4 text-green-600" />
							<span className="text-green-900">
								You were referred by a friend! Thank them for inviting you.
							</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Referrals List */}
			{referrals.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Your Referrals</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{referrals.map((referral, index) => (
								<ReferralItem
									key={referral.id}
									referral={referral}
									index={index}
								/>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{referrals.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						<Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
						<p className="font-medium">No referrals yet</p>
						<p className="text-sm mt-2">
							Share your referral code to start earning rewards!
						</p>
					</CardContent>
				</Card>
			)}
		</motion.div>
	)
}

function StatCard({
	title,
	value,
	icon: Icon,
	color,
}: {
	title: string
	value: number
	icon: typeof Users
	color: string
}) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ y: -2 }}
		>
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">{title}</p>
							<motion.p
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring' }}
								className={`text-3xl font-bold mt-2 ${color}`}
							>
								{value}
							</motion.p>
						</div>
						<div className={`p-3 rounded-lg bg-muted ${color}`}>
							<Icon className="h-6 w-6" />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}

function ReferralItem({
	referral,
	index,
}: {
	referral: Referral
	index: number
}) {
	const statusColors: Record<string, string> = {
		pending: 'bg-gray-100 text-gray-600',
		onboarded: 'bg-blue-100 text-blue-600',
		first_donation: 'bg-green-100 text-green-600',
		active: 'bg-purple-100 text-purple-600',
	}

	const statusLabels: Record<string, string> = {
		pending: 'Pending',
		onboarded: 'Onboarded',
		first_donation: 'First Donation',
		active: 'Active',
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.1 }}
			className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
		>
			<div className="flex items-center gap-3 flex-1">
				<div className="p-2 rounded-full bg-primary/10">
					<Users className="h-4 w-4 text-primary" />
				</div>
				<div className="flex-1">
					<p className="font-medium text-sm">
						Referral #{referral.id.slice(0, 8)}
					</p>
					<p className="text-xs text-muted-foreground">
						Joined {new Date(referral.created_at).toLocaleDateString()}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<Badge className={statusColors[referral.status]}>
					{statusLabels[referral.status]}
				</Badge>
				{referral.total_donations > 0 && (
					<span className="text-sm font-medium">
						{referral.total_donations} donation
						{referral.total_donations !== 1 ? 's' : ''}
					</span>
				)}
			</div>
		</motion.div>
	)
}
