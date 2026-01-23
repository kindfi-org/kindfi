'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { Heart, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'

type Role = Database['public']['Enums']['user_role']

interface RoleSelectionModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	userId: string
	currentRole: Role | null
	onRoleSelected?: (role: Role) => void
}

export function RoleSelectionModal({
	open,
	onOpenChange,
	userId,
	currentRole,
	onRoleSelected,
}: RoleSelectionModalProps) {
	const [isSaving, setIsSaving] = useState(false)
	const [selectedRole, setSelectedRole] = useState<Role | null>(currentRole)

	const handleRoleSelect = async (role: Role) => {
		if (isSaving) return

		setIsSaving(true)
		try {
			const supabase = createSupabaseBrowserClient()
			const { error } = await supabase
				.from('profiles')
				.update({ role })
				.eq('id', userId)

			if (error) throw error

			setSelectedRole(role)
			toast.success(`Welcome as a ${role === 'creator' ? 'Creator' : 'Donor'}!`)
			onRoleSelected?.(role)
			onOpenChange(false)
			// Reload page to reflect changes
			window.location.reload()
		} catch (error) {
			console.error('Failed to update role:', error)
			toast.error('Failed to update role. Please try again.')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-bold">
						Welcome to KindFi
					</DialogTitle>
					<DialogDescription className="text-center text-base">
						Select how you&apos;d like to use KindFi. You can&apos;t change this
						later in your settings.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4 sm:grid-cols-2">
					<motion.button
						whileHover={{ scale: 1.02, y: -4 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => handleRoleSelect('creator')}
						disabled={isSaving}
						className={`group relative overflow-hidden rounded-lg border-2 p-6 text-left transition-all ${
							selectedRole === 'creator'
								? 'border-[#000124] bg-[#000124]/5 shadow-lg'
								: 'border-border bg-card hover:border-[#000124]/50 hover:bg-[#000124]/5'
						} ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
					>
						<div className="absolute inset-0 bg-gradient-to-br from-[#000124]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
						<div className="relative z-10">
							<div
								className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg ${
									selectedRole === 'creator'
										? 'bg-[#000124] text-white'
										: 'bg-[#000124]/10 text-[#000124]'
								}`}
							>
								<Lightbulb className="h-6 w-6" />
							</div>
							<h3 className="mb-2 text-lg font-bold">Creator</h3>
							<p className="text-sm text-muted-foreground">
								Create and manage donations raising campaigns for your projects.
							</p>
							{selectedRole === 'creator' && (
								<motion.div
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									className="mt-3 text-xs font-medium text-[#000124]"
								>
									✓ Selected
								</motion.div>
							)}
						</div>
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.02, y: -4 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => handleRoleSelect('donor')}
						disabled={isSaving}
						className={`group relative overflow-hidden rounded-lg border-2 p-6 text-left transition-all ${
							selectedRole === 'donor'
								? 'border-[#000124] bg-[#000124]/5 shadow-lg'
								: 'border-border bg-card hover:border-[#000124]/50 hover:bg-[#000124]/5'
						} ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
					>
						<div className="absolute inset-0 bg-gradient-to-br from-[#000124]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
						<div className="relative z-10">
							<div
								className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg ${
									selectedRole === 'donor'
										? 'bg-[#000124] text-white'
										: 'bg-[#000124]/10 text-[#000124]'
								}`}
							>
								<Heart className="h-6 w-6" />
							</div>
							<h3 className="mb-2 text-lg font-bold">Donor</h3>
							<p className="text-sm text-muted-foreground">
								Support projects and track your impact.
							</p>
							{selectedRole === 'donor' && (
								<motion.div
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									className="mt-3 text-xs font-medium text-[#151520]"
								>
									✓ Selected
								</motion.div>
							)}
						</div>
					</motion.button>
				</div>

				{isSaving && (
					<div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-[#000124] border-t-transparent" />
						<span>Saving your choice...</span>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
