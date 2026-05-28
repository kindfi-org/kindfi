'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Textarea } from '~/components/base/textarea'
import { useI18n } from '~/lib/i18n'
import { ProfileSurfaceCard } from '../profile-surface-card'
import { logger } from '@/lib/logger'

interface PersonalInfoCardProps {
	userId: string
	displayName: string
	bio: string
	imageUrl: string
	_email: string
}

export function PersonalInfoCard({
	userId,
	displayName,
	bio,
	imageUrl,
	_email,
}: PersonalInfoCardProps) {
	const { t } = useI18n()
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

			toast.success(t('profile.profileUpdated'))
			setIsEditing(false)
			window.location.reload()
		} catch (error) {
			logger.error(error)
			toast.error(t('profile.profileUpdateFailed'))
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<ProfileSurfaceCard className="h-full">
			<div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">
						{t('profile.personalInfoTitle')}
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						{t('profile.personalInfoDescription')}
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsEditing(!isEditing)}
					className="rounded-full"
				>
					{isEditing ? (
						t('profile.cancel')
					) : (
						<>
							<Pencil className="mr-2 h-4 w-4" />
							{t('profile.edit')}
						</>
					)}
				</Button>
			</div>

			<form action={onUpdateProfile} className="space-y-5">
				<div className="space-y-2">
					<Label htmlFor="display_name">{t('profile.displayName')}</Label>
					<Input
						id="display_name"
						name="display_name"
						defaultValue={displayName}
						disabled={!isEditing}
						required
						className="rounded-xl disabled:bg-slate-50"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="bio">{t('profile.bio')}</Label>
					<Textarea
						id="bio"
						name="bio"
						defaultValue={bio}
						disabled={!isEditing}
						rows={4}
						placeholder={t('profile.bioPlaceholder')}
						className="resize-none rounded-xl disabled:bg-slate-50"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="image_url">{t('profile.avatarUrl')}</Label>
					<Input
						id="image_url"
						name="image_url"
						type="url"
						defaultValue={imageUrl}
						disabled={!isEditing}
						placeholder="https://example.com/avatar.jpg"
						className="rounded-xl disabled:bg-slate-50"
					/>
				</div>
				<AnimatePresence>
					{isEditing ? (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
						>
							<Button
								type="submit"
								disabled={isSaving}
								className="gradient-btn w-full rounded-full text-white"
							>
								{isSaving ? t('profile.saving') : t('profile.saveChanges')}
							</Button>
						</motion.div>
					) : null}
				</AnimatePresence>
			</form>
		</ProfileSurfaceCard>
	)
}
