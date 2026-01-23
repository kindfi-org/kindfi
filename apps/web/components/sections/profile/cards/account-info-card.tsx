'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
			transition={{ type: 'spring', stiffness: 400, damping: 25 }}
			className="h-full"
		>
			<Card className="h-full border-0 overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300">
				{/* Top gradient bar */}
				<div className="h-2 bg-gradient-to-r from-[#000124] to-[#000124]/70" />

				<CardHeader className="pb-5 pt-6 border-b border-gray-200">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<CardTitle className="text-xl font-bold text-gray-800 mb-2">
								Account Information
							</CardTitle>
							<CardDescription className="text-sm font-medium text-gray-600">
								Manage your account settings and preferences
							</CardDescription>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditing(!isEditing)}
							className="hover:bg-gray-100 rounded-lg"
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
					</div>
				</CardHeader>
				<CardContent className="space-y-5 pt-6">
					<motion.div
						className="space-y-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1 }}
					>
						<Label className="text-sm font-medium">Email</Label>
						<Input
							value={userEmail}
							readOnly
							className="bg-muted/60 border-border/50 cursor-not-allowed"
						/>
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
						<Label className="text-sm font-medium">Member Since</Label>
						<Input
							value={new Date(createdAt).toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric',
							})}
							readOnly
							className="bg-muted/60 border-border/50 cursor-not-allowed"
						/>
					</motion.div>
					<form action={onUpdateSlug} className="space-y-2">
						<Label htmlFor="slug" className="text-sm font-medium">
							Profile Handle
						</Label>
						<div className="flex gap-0">
							<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted/80 text-muted-foreground text-sm font-medium border-border/50">
								kindfi.io/profile/
							</span>
							<Input
								id="slug"
								name="slug"
								defaultValue={slug}
								placeholder="your-handle"
								disabled={!isEditing}
								className="rounded-l-none border-border/50 transition-all duration-200 disabled:bg-muted/60 disabled:cursor-not-allowed focus:border-[#000124]/50"
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
										className="w-full bg-[#000124] hover:bg-[#000124]/90 text-white transition-all font-semibold shadow-md hover:shadow-lg"
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
