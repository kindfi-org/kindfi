'use client'

import { useFormContext } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

export function FundingFields() {
	const form = useFormContext<CreateProjectFormData>()

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
			<FormField
				control={form.control}
				name="targetAmount"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Target Amount <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<span className="text-gray-500 sm:text-sm">$</span>
								</div>
								<Input
									type="number"
									placeholder="50000"
									className="bg-white border-green-600 pl-7"
									value={field.value ?? ''}
									onChange={(e) =>
										field.onChange(
											e.target.value === ''
												? undefined
												: Number(e.target.value),
										)
									}
								/>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="minimumInvestment"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Minimum Investment{' '}
							<span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<span className="text-gray-500 sm:text-sm">$</span>
								</div>
								<Input
									type="number"
									placeholder="100"
									className="bg-white border-green-600 pl-7"
									value={field.value ?? ''}
									onChange={(e) =>
										field.onChange(
											e.target.value === ''
												? undefined
												: Number(e.target.value),
										)
									}
								/>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
