'use client'

import type { Database } from '@services/supabase'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'
import { updateProfileRoleAction } from '~/app/actions/profile/update-profile-role'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'

type Role = Database['public']['Enums']['user_role']
type SelectableRole = Extract<Role, 'creator' | 'donor'>

interface RoleCardProps {
	userId: string
	currentRole: Role
}

export function RoleCard({ userId: _userId, currentRole }: RoleCardProps) {
	const [isChanging, setIsChanging] = useState(false)
	const [selectedRole, setSelectedRole] = useState<Role>(currentRole)

	const handleRoleChange = async (newRole: SelectableRole) => {
		setIsChanging(true)
		try {
			const result = await updateProfileRoleAction({ role: newRole })

			if (!result.success) {
				throw new Error(result.error)
			}

			setSelectedRole(newRole)
			toast.success(`Role updated to ${newRole === 'creator' ? 'Creator' : 'Donor'}`)
			window.location.reload()
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update role'
			toast.error(message)
		} finally {
			setIsChanging(false)
		}
	}

	return (
		<motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
			<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-all duration-300 relative group">
				<div className="absolute top-0 left-0 w-32 h-32 bg-secondary/10 rounded-full -ml-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />

				<CardHeader className="pb-3 relative z-10">
					<CardTitle className="text-base font-semibold text-foreground">User Type</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 relative z-10">
					<Select
						value={selectedRole}
						onValueChange={(value) => handleRoleChange(value as SelectableRole)}
						disabled={isChanging}
					>
						<SelectTrigger className="w-full border-border bg-background hover:border-primary/50">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="creator">Creator</SelectItem>
							<SelectItem value="donor">Donor</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-xs text-muted-foreground">
						{selectedRole === 'creator'
							? 'Create and manage campaigns'
							: 'Support projects and track your impact'}
					</p>
				</CardContent>
			</Card>
		</motion.div>
	)
}
