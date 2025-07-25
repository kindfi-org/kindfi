import { AlertCircle, EyeOff, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type UseFormReturn, useFieldArray } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { Switch } from '~/components/base/switch'
import type { formInputs } from '../team-members'

type VisibilityToggleProps = {
	form: UseFormReturn<formInputs>
	roles: {
		value: string
		label: string
	}[]
}

export function VisibilityToggle({ form, roles }: VisibilityToggleProps) {
	const [showHiddenMembers, setShowHiddenMembers] = useState(false)

	const {
		fields: hiddenFields,
		append: appendHidden,
		remove: removeHidden,
	} = useFieldArray({
		name: 'hiddenTeamMembers',
		control: form.control,
	})

	return (
		<Card className="relative border-0 shadow-lg bg-white/50 backdrop-blur-sm overflow-hidden">
			<div className="absolute right-4 top-4 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
				Beta
			</div>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<EyeOff className="h-5 w-5" />
					Hidden Team Members
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div className="space-y-0.5">
						<Label className="text-base">Show Hidden Members</Label>
						<p className="text-sm text-muted-foreground">
							Toggle to view and manage private collaborators
						</p>
					</div>
					<Switch
						checked={showHiddenMembers}
						onCheckedChange={setShowHiddenMembers}
						aria-label="Toggle hidden members"
						className="bg-green-500"
					/>
				</div>

				{showHiddenMembers && (
					<>
						{hiddenFields.map((field, index) => (
							<div
								key={field.id}
								className="relative space-y-4 rounded-lg border p-4 transition-all duration-200"
							>
								<button
									type="button"
									className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
									onClick={() => removeHidden(index)}
								>
									<Trash2 className="h-4 w-4" />
								</button>

								<div className="grid gap-6 md:grid-cols-2">
									<FormField
										control={form.control}
										name={`hiddenTeamMembers.${index}.name`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Full Name</FormLabel>
												<FormControl>
													<Input
														placeholder="Enter team member's name"
														className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
														{...field}
													/>
												</FormControl>
												<FormMessage className="text-blue-500" />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name={`hiddenTeamMembers.${index}.email`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="Enter email address"
														className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
														{...field}
													/>
												</FormControl>
												<FormMessage className="text-blue-500" />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name={`hiddenTeamMembers.${index}.title`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Title</FormLabel>
												<FormControl>
													<Input
														placeholder="e.g., Chief Technology Officer"
														className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
														{...field}
													/>
												</FormControl>
												<FormMessage className="text-blue-500" />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name={`hiddenTeamMembers.${index}.role`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Role</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20">
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
												<FormMessage className="text-blue-500" />
											</FormItem>
										)}
									/>
								</div>
							</div>
						))}

						<button
							type="button"
							className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							onClick={() =>
								appendHidden({
									name: '',
									email: '',
									title: '',
									role: '',
									profileImage: '',
									isHidden: true,
								})
							}
						>
							<EyeOff className="mr-2 h-4 w-4" />
							Add Hidden Team Member
						</button>

						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Private Collaboration</AlertTitle>
							<AlertDescription>
								Hidden team members can access the project dashboard but won't
								be displayed publicly on your project page.
							</AlertDescription>
						</Alert>
					</>
				)}
			</CardContent>
		</Card>
	)
}
