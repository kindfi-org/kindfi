'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
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
import { Textarea } from '~/components/base/textarea'

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
