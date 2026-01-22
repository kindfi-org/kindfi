'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'

type Role = Database['public']['Enums']['user_role']

interface RoleCardProps {
	userId: string
	currentRole: Role
}

export function RoleCard({ userId, currentRole }: RoleCardProps) {
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
			toast.success(
				`Role updated to ${newRole === 'kindler' ? 'Creator' : 'Donor'}`,
			)
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
					<CardTitle className="text-base font-semibold text-foreground">
						User Type
					</CardTitle>
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
