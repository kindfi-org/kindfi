import { UserPlus, Users } from 'lucide-react'
import { type UseFormReturn, useFieldArray } from 'react-hook-form'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { formInputs } from '../team-members'
import TeamMemberCard from './team-member-card'

interface TeamMemberListProps {
	form: UseFormReturn<formInputs>
	roles: { value: string; label: string }[]
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({ form, roles }) => {
	const {
		fields: teamFields,
		append: appendTeam,
		remove: removeTeam,
	} = useFieldArray({
		control: form.control,
		name: 'teamMembers',
	})

	return (
		<Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Public Team Members
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{teamFields.map((field, index) => (
					<TeamMemberCard
						key={field.id}
						form={form}
						index={index}
						roles={roles}
						removeTeam={removeTeam}
					/>
				))}

				<button
					type="button"
					className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
					onClick={() =>
						appendTeam({
							name: '',
							email: '',
							title: '',
							role: '',
							profileImage: '',
							isHidden: false,
						})
					}
				>
					<UserPlus className="mr-2 h-4 w-4" />
					Add Team Member
				</button>
			</CardContent>
		</Card>
	)
}

export { TeamMemberList }
