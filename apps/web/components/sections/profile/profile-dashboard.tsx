'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Database } from '@services/supabase'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Copy, Pencil, Shield, Sparkles, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { Textarea } from '~/components/base/textarea'
import { KYCModal } from '~/components/shared/kyc/kyc-modal'
import { staggerContainer } from '~/lib/constants/animations'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
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
}: ProfileDashboardProps) {
	const role: Role = user.profile?.role ?? 'kinder'
	const displayName = useMemo(
		() => user.profile?.display_name || user.email?.split('@')[0] || 'You',
		[user.profile?.display_name, user.email],
	)
	const { address, connect, isConnected } = useWallet()
	const [isKYCModalOpen, setIsKYCModalOpen] = useState(false)
	const imageUrl = user.profile?.image_url ?? null

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
				<motion.div variants={itemVariants}>
					<WalletCard
						address={address}
						isConnected={isConnected}
						onConnect={connect}
					/>
				</motion.div>
				<motion.div variants={itemVariants}>
					<KYCCard onStartKYC={() => setIsKYCModalOpen(true)} />
				</motion.div>
				<motion.div variants={itemVariants}>
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
									email={user.email}
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

			<KYCModal
				isOpen={isKYCModalOpen}
				onClose={() => setIsKYCModalOpen(false)}
			/>
		</motion.div>
	)
}

function ProfileHeader({
	displayName,
	email,
	imageUrl,
	role,
	createdAt,
}: {
	displayName: string
	email: string
	imageUrl: string | null
	role: Role
	createdAt: string
}) {
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
							Member since {new Date(createdAt).toLocaleDateString('en-US', {
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

function WalletCard({
	address,
	isConnected,
	onConnect,
}: {
	address: string | null
	isConnected: boolean
	onConnect: () => Promise<void>
}) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		if (!address) return
		try {
			await navigator.clipboard.writeText(address)
			setCopied(true)
			toast.success('Wallet address copied!')
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy address:', error)
			toast.error('Failed to copy address')
		}
	}

	const displayAddress = address
		? `${address.slice(0, 8)}...${address.slice(-8)}`
		: 'Not connected'

	return (
		<motion.div
			whileHover={{ y: -5 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-all duration-300 relative group">
				{/* Decorative shape */}
				<div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
				
				<CardHeader className="pb-3 relative z-10">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
							<motion.div
								animate={{ rotate: [0, 360] }}
								transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
							>
								<Wallet className="h-5 w-5" />
							</motion.div>
							Wallet
						</CardTitle>
						{isConnected && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="relative"
							>
								<div className="h-3 w-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
								<div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping" />
							</motion.div>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-3 relative z-10">
					{isConnected && address ? (
						<>
							<div className="flex items-center justify-between p-3 bg-muted/50 backdrop-blur-sm rounded-xl border border-border">
								<code className="text-sm font-mono text-foreground">{displayAddress}</code>
								<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleCopy}
										className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
									>
										{copied ? (
											<CheckCircle2 className="h-4 w-4" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</motion.div>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="w-full border-border hover:bg-muted"
								onClick={handleCopy}
							>
								<Copy className="h-3 w-3 mr-2" />
								Copy Full Address
							</Button>
						</>
					) : (
						<>
							<p className="text-sm text-muted-foreground">
								Connect your Stellar wallet to start contributing
							</p>
							<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<Button 
									onClick={onConnect} 
									className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
									size="sm"
								>
									<Wallet className="h-4 w-4 mr-2" />
									Connect Wallet
								</Button>
							</motion.div>
						</>
					)}
				</CardContent>
			</Card>
		</motion.div>
	)
}

function KYCCard({ onStartKYC }: { onStartKYC: () => void }) {
	return (
		<motion.div
			whileHover={{ y: -5, scale: 1.02 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-all duration-300 relative group border-2 border-primary/20">
				{/* Decorative elements */}
				<div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
				<div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 rotate-45" />
				
				<CardHeader className="pb-3 relative z-10">
					<CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
						<motion.div
							animate={{ rotate: [0, -10, 10, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
						>
							<Shield className="h-5 w-5 text-primary" />
						</motion.div>
						KYC Verification
					</CardTitle>
				</CardHeader>
				<CardContent className="relative z-10">
					<p className="text-sm text-muted-foreground mb-4">
						Complete verification to unlock all features and build trust
					</p>
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Button
							onClick={onStartKYC}
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
							size="sm"
						>
							<Shield className="h-4 w-4 mr-2" />
							Start KYC Process
						</Button>
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	)
}

function RoleCard({
	userId,
	currentRole,
}: {
	userId: string
	currentRole: Role
}) {
	const [isChanging, setIsChanging] = useState(false)
	const [selectedRole, setSelectedRole] = useState<Role>(currentRole)

	const handleRoleChange = async (newRole: Role) => {
		setIsChanging(true)
		try {
			const supabase = createSupabaseBrowserClient()
			const { error } = await supabase
				.from('profiles')
				.update({ role: newRole })
				.eq('id', userId)

			if (error) throw error

			setSelectedRole(newRole)
			toast.success(`Role updated to ${newRole === 'kindler' ? 'Creator' : 'Donor'}`)
			// Reload page to reflect changes
			window.location.reload()
		} catch (error) {
			console.error('Failed to update role:', error)
			toast.error('Failed to update role')
		} finally {
			setIsChanging(false)
		}
	}

	return (
		<motion.div
			whileHover={{ y: -5 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-all duration-300 relative group">
				<div className="absolute top-0 left-0 w-32 h-32 bg-secondary/10 rounded-full -ml-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
				
				<CardHeader className="pb-3 relative z-10">
					<CardTitle className="text-base font-semibold text-foreground">User Type</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 relative z-10">
					<Select
						value={selectedRole}
						onValueChange={(value) => handleRoleChange(value as Role)}
						disabled={isChanging}
					>
						<SelectTrigger className="w-full border-border bg-background hover:border-primary/50">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="kindler">Creator</SelectItem>
							<SelectItem value="kinder">Donor</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-xs text-muted-foreground">
						{selectedRole === 'kindler'
							? 'Create and manage campaigns'
							: 'Support projects and track your impact'}
					</p>
				</CardContent>
			</Card>
		</motion.div>
	)
}

function PersonalInfoCard({
	userId,
	displayName,
	bio,
	imageUrl,
	email,
}: {
	userId: string
	displayName: string
	bio: string
	imageUrl: string
	email: string
}) {
	const [isEditing, setIsEditing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	async function onUpdateProfile(formData: FormData) {
		setIsSaving(true)
		try {
		const supabase = createSupabaseBrowserClient()
		const payload = {
			display_name: (formData.get('display_name') as string) ?? '',
			bio: (formData.get('bio') as string) ?? '',
			image_url: (formData.get('image_url') as string) ?? '',
		}
		const { error } = await supabase
			.from('profiles')
			.update(payload)
			.eq('id', userId)

			if (error) throw error

			toast.success('Profile updated successfully!')
			setIsEditing(false)
			window.location.reload()
		} catch (error) {
			console.error(error)
			toast.error('Failed to update profile')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			whileHover={{ y: -2 }}
			transition={{ type: 'spring', stiffness: 200 }}
		>
			<Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
				<div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
				
				<CardHeader className="relative z-10">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-foreground">
								Personal Information
							</CardTitle>
							<CardDescription>
								Update your profile details and public information
							</CardDescription>
						</div>
						<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsEditing(!isEditing)}
								className="hover:bg-muted"
							>
								{isEditing ? (
									<>Cancel</>
								) : (
									<>
										<Pencil className="h-4 w-4 mr-2" />
										Edit
									</>
								)}
							</Button>
						</motion.div>
					</div>
			</CardHeader>
				<CardContent className="relative z-10">
				<form action={onUpdateProfile} className="space-y-4">
					<div className="space-y-2">
							<Label htmlFor="display_name">Display Name</Label>
						<Input
							id="display_name"
							name="display_name"
							defaultValue={displayName}
								disabled={!isEditing}
								required
								className="transition-all duration-200 disabled:bg-muted/50"
						/>
					</div>
					<div className="space-y-2">
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								name="bio"
								defaultValue={bio}
								disabled={!isEditing}
								rows={4}
								placeholder="Tell us about yourself..."
								className="transition-all duration-200 disabled:bg-muted/50 resize-none"
							/>
					</div>
					<div className="space-y-2">
							<Label htmlFor="image_url">Avatar URL</Label>
							<Input
								id="image_url"
								name="image_url"
								type="url"
								defaultValue={imageUrl}
								disabled={!isEditing}
								placeholder="https://example.com/avatar.jpg"
								className="transition-all duration-200 disabled:bg-muted/50"
							/>
					</div>
						<AnimatePresence>
							{isEditing && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Button 
										type="submit" 
										disabled={isSaving} 
										className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
									>
										{isSaving ? 'Saving...' : 'Save Changes'}
									</Button>
								</motion.div>
							)}
						</AnimatePresence>
				</form>
			</CardContent>
		</Card>
		</motion.div>
	)
}

function AccountInfoCard({
	userEmail,
	createdAt,
	slug,
}: {
	userEmail: string
	createdAt: string
	slug: string
}) {
	const [isEditing, setIsEditing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	async function onUpdateSlug(formData: FormData) {
		setIsSaving(true)
		try {
			const nextSlug = (formData.get('slug') as string)?.trim().toLowerCase()
			if (!nextSlug) {
				toast.error('Slug cannot be empty')
				return
			}

			const res = await fetch('/api/profile/update-slug', {
				method: 'POST',
				body: JSON.stringify({ slug: nextSlug }),
				headers: { 'Content-Type': 'application/json' },
			})

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.message || 'Failed to update slug')
			}

			toast.success('Profile handle updated!')
			setIsEditing(false)
			window.location.reload()
		} catch (error) {
			console.error('Failed to update slug:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to update slug',
			)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			whileHover={{ y: -2 }}
			transition={{ type: 'spring', stiffness: 200 }}
		>
			<Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
				<div className="absolute top-0 left-0 w-40 h-40 bg-secondary/5 rounded-full -ml-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
				
				<CardHeader className="relative z-10">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-foreground">
								Account Information
							</CardTitle>
							<CardDescription>
								Manage your account settings and preferences
							</CardDescription>
						</div>
						<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsEditing(!isEditing)}
								className="hover:bg-muted"
							>
								{isEditing ? (
									<>Cancel</>
								) : (
									<>
										<Pencil className="h-4 w-4 mr-2" />
										Edit
									</>
								)}
							</Button>
						</motion.div>
					</div>
			</CardHeader>
				<CardContent className="space-y-4 relative z-10">
					<motion.div 
						className="space-y-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1 }}
					>
						<Label>Email</Label>
						<Input value={userEmail} readOnly className="bg-muted/50 border-blue-200" />
						<p className="text-xs text-muted-foreground">
							Email cannot be changed here
						</p>
					</motion.div>
					<motion.div 
						className="space-y-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<Label>Member Since</Label>
						<Input
							value={new Date(createdAt).toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric',
							})}
							readOnly
							className="bg-muted/50 border-blue-200"
						/>
					</motion.div>
					<form action={onUpdateSlug} className="space-y-2">
						<Label htmlFor="slug">Profile Handle</Label>
						<div className="flex gap-2">
							<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm font-medium border-border">
								kindfi.io/profile/
							</span>
							<Input
								id="slug"
								name="slug"
								defaultValue={slug}
								placeholder="your-handle"
								disabled={!isEditing}
								className="rounded-l-none border-border transition-all duration-200 disabled:bg-muted/50"
								required
							/>
						</div>
						<AnimatePresence>
							{isEditing && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Button 
										type="submit" 
										disabled={isSaving} 
										className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
									>
										{isSaving ? 'Saving...' : 'Save Handle'}
									</Button>
								</motion.div>
							)}
						</AnimatePresence>
					</form>
			</CardContent>
		</Card>
		</motion.div>
	)
}
