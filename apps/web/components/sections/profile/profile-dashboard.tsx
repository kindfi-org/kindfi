'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Database } from '@services/supabase'
import { useMemo, useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Input } from '~/components/base/input'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { Textarea } from '~/components/base/textarea'
import { KYCModal } from '~/components/shared/kyc/kyc-modal'
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

export function ProfileDashboard({
	user,
	defaultTab = 'overview',
}: ProfileDashboardProps) {
	const role: Role = user.profile?.role ?? 'kinder'
	const displayName = useMemo(
		() => user.profile?.display_name || user.email?.split('@')[0] || 'You',
		[user.profile?.display_name, user.email],
	)

	return (
		<section className="container mx-auto px-4 py-6 space-y-6">
			<Tabs defaultValue={defaultTab}>
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					{role === 'kindler' ? (
						<CreatorProfile userId={user.id} displayName={displayName} />
					) : (
						<DonorProfile userId={user.id} displayName={displayName} />
					)}
				</TabsContent>

				<TabsContent value="settings">
					<div className="grid gap-6 md:grid-cols-2">
						<AccountSettings
							userEmail={user.email}
							createdAt={user.created_at}
							slug={user.profile?.slug ?? ''}
						/>
						<ProfileSettings
							userId={user.id}
							displayName={user.profile?.display_name ?? ''}
							bio={user.profile?.bio ?? ''}
							imageUrl={user.profile?.image_url ?? ''}
						/>
						<KYCSettings />
					</div>
				</TabsContent>
			</Tabs>
		</section>
	)
}

function AccountSettings({
	userEmail,
	createdAt,
	slug,
}: {
	userEmail: string
	createdAt: string
	slug: string
}) {
	async function onUpdateSlug(formData: FormData) {
		const supabase = createSupabaseBrowserClient()
		const nextSlug = (formData.get('slug') as string)?.trim().toLowerCase()
		if (!nextSlug) return
		// Submit to server action
		const res = await fetch('/api/profile/update-slug', {
			method: 'POST',
			body: JSON.stringify({ slug: nextSlug }),
			headers: { 'Content-Type': 'application/json' },
		})
		if (!res.ok) {
			console.error('Failed to update slug')
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Account</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">Email</label>
					<Input value={userEmail} readOnly />
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium">Member since</label>
					<Input value={new Date(createdAt).toLocaleDateString()} readOnly />
				</div>
				<form action={onUpdateSlug} className="space-y-2">
					<label htmlFor="slug" className="text-sm font-medium">
						Profile handle
					</label>
					<div className="flex gap-2">
						<Input
							id="slug"
							name="slug"
							defaultValue={slug}
							placeholder="your-handle"
						/>
						<Button type="submit">Save</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

function ProfileSettings({
	userId,
	displayName,
	bio,
	imageUrl,
}: {
	userId: string
	displayName: string
	bio: string
	imageUrl: string
}) {
	async function onUpdateProfile(formData: FormData) {
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
		if (error) console.error(error.message)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
			</CardHeader>
			<CardContent>
				<form action={onUpdateProfile} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="display_name" className="text-sm font-medium">
							Display name
						</label>
						<Input
							id="display_name"
							name="display_name"
							defaultValue={displayName}
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="bio" className="text-sm font-medium">
							Bio
						</label>
						<Textarea id="bio" name="bio" defaultValue={bio} rows={5} />
					</div>
					<div className="space-y-2">
						<label htmlFor="image_url" className="text-sm font-medium">
							Avatar URL
						</label>
						<Input id="image_url" name="image_url" defaultValue={imageUrl} />
					</div>
					<Button type="submit">Save</Button>
				</form>
			</CardContent>
		</Card>
	)
}

function KYCSettings() {
	const [isKYCModalOpen, setIsKYCModalOpen] = useState(false)

	return (
		<Card>
			<CardHeader>
				<CardTitle>KYC Verification</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<p className="text-sm text-muted-foreground">
					Complete KYC to unlock all features and improve trust in the
					community.
				</p>
				<Button onClick={() => setIsKYCModalOpen(true)}>Start KYC</Button>
				<KYCModal
					isOpen={isKYCModalOpen}
					onClose={() => setIsKYCModalOpen(false)}
				/>
			</CardContent>
		</Card>
	)
}
