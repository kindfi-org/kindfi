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
								Personal Information
							</CardTitle>
							<CardDescription className="text-sm font-medium text-gray-600">
								Update your profile details and public information
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
					<form action={onUpdateProfile} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="display_name" className="text-sm font-medium">
								Display Name
							</Label>
							<Input
								id="display_name"
								name="display_name"
								defaultValue={displayName}
								disabled={!isEditing}
								required
								className="transition-all duration-200 disabled:bg-muted/60 disabled:cursor-not-allowed border-border/50 focus:border-[#000124]/50"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="bio" className="text-sm font-medium">
								Bio
							</Label>
							<Textarea
								id="bio"
								name="bio"
								defaultValue={bio}
								disabled={!isEditing}
								rows={4}
								placeholder="Tell us about yourself..."
								className="transition-all duration-200 disabled:bg-muted/60 disabled:cursor-not-allowed resize-none border-border/50 focus:border-[#000124]/50"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="image_url" className="text-sm font-medium">
								Avatar URL
							</Label>
							<Input
								id="image_url"
								name="image_url"
								type="url"
								defaultValue={imageUrl}
								disabled={!isEditing}
								placeholder="https://example.com/avatar.jpg"
								className="transition-all duration-200 disabled:bg-muted/60 disabled:cursor-not-allowed border-border/50 focus:border-[#000124]/50"
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
