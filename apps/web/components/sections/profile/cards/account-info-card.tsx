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
						<Input
							value={userEmail}
							readOnly
							className="bg-muted/50 border-blue-200"
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
