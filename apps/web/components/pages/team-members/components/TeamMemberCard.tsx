import { Trash2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import type { formInputs } from '../team-members'
import ImageUploader from './ImageUploader'

interface TeamMemberCardProps {
	form: UseFormReturn<formInputs>
	index: number
	roles: { value: string; label: string }[]
	removeTeam: (index: number) => void
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
	form,
	index,
	roles,
	removeTeam,
}) => {
	return (
		<div className="relative space-y-4 rounded-lg border p-4 transition-all duration-200">
			{index > 0 && (
				<button
					type="button"
					className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
					onClick={() => removeTeam(index)}
				>
					<Trash2 className="h-4 w-4" />
				</button>
			)}

			<div className="grid gap-6 md:grid-cols-2">
				<FormField
					control={form.control}
					name={`teamMembers.${index}.name`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Full Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter team member's name"
									className="h-12 text-base"
									{...field}
								/>
							</FormControl>
							<FormMessage className="font-bold gradient-text" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`teamMembers.${index}.email`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="Enter email address"
									className="h-12 text-base"
									{...field}
								/>
							</FormControl>
							<FormMessage className="font-bold gradient-text" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`teamMembers.${index}.title`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., Chief Technology Officer"
									className="h-12 text-base"
									{...field}
								/>
							</FormControl>
							<FormMessage className="font-bold gradient-text" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name={`teamMembers.${index}.role`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Role</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="h-12 text-base">
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.value} value={role.value}>
											{role.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage className="font-bold gradient-text" />
						</FormItem>
					)}
				/>
			</div>

			<ImageUploader form={form} index={index} />
		</div>
	)
}

export default TeamMemberCard
