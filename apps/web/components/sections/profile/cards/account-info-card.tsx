'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { useI18n } from '~/lib/i18n'
import { ProfileSurfaceCard } from '../profile-surface-card'
import { logger } from '@/lib/logger'

interface AccountInfoCardProps {
	userEmail: string
	createdAt: string
	slug: string
}

export function AccountInfoCard({
	userEmail,
	createdAt,
	slug,
}: AccountInfoCardProps) {
	const { t } = useI18n()
	const [isEditing, setIsEditing] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	async function onUpdateSlug(formData: FormData) {
		setIsSaving(true)
		try {
			const nextSlug = (formData.get('slug') as string)?.trim().toLowerCase()
			if (!nextSlug) {
				toast.error(t('profile.slugEmpty'))
				return
			}

			const res = await fetch('/api/profile/update-slug', {
				method: 'POST',
				body: JSON.stringify({ slug: nextSlug }),
				headers: { 'Content-Type': 'application/json' },
			})

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.message || t('profile.handleUpdateFailed'))
			}

			toast.success(t('profile.handleUpdated'))
			setIsEditing(false)
			window.location.reload()
		} catch (error) {
			logger.error('Failed to update slug:', error)
			toast.error(
				error instanceof Error ? error.message : t('profile.handleUpdateFailed'),
			)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<ProfileSurfaceCard className="h-full">
			<div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">
						{t('profile.accountInfoTitle')}
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						{t('profile.accountInfoDescription')}
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

			<div className="space-y-5">
				<div className="space-y-2">
					<Label>{t('profile.email')}</Label>
					<Input
						value={userEmail}
						readOnly
						className="cursor-not-allowed rounded-xl bg-slate-50"
					/>
					<p className="text-xs text-muted-foreground">{t('profile.emailReadonly')}</p>
				</div>

				<div className="space-y-2">
					<Label>{t('profile.memberSinceLabel')}</Label>
					<Input
						value={new Date(createdAt).toLocaleDateString(undefined, {
							month: 'long',
							day: 'numeric',
							year: 'numeric',
						})}
						readOnly
						className="cursor-not-allowed rounded-xl bg-slate-50"
					/>
				</div>

				<form action={onUpdateSlug} className="space-y-2">
					<Label htmlFor="slug">{t('profile.profileHandle')}</Label>
					<div className="flex">
						<span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm text-muted-foreground">
							kindfi.io/u/
						</span>
						<Input
							id="slug"
							name="slug"
							defaultValue={slug}
							placeholder="your-handle"
							disabled={!isEditing}
							className="rounded-l-none rounded-r-xl disabled:bg-slate-50"
							required
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
									className="gradient-btn mt-3 w-full rounded-full text-white"
								>
									{isSaving ? t('profile.saving') : t('profile.saveHandle')}
								</Button>
							</motion.div>
						) : null}
					</AnimatePresence>
				</form>
			</div>
		</ProfileSurfaceCard>
	)
}
