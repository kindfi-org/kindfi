import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { Control } from 'react-hook-form'
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
import type { ProjectFormData } from '~/lib/validators/project'

type FundingInformationProps = {
	control: Control<ProjectFormData>
	previewImage: string | null
	setPreviewImage: (image: string | null) => void
	handleImageUpload: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => Promise<void>
}

export function FundingInformation({
	control,
	setPreviewImage,
	previewImage,
	handleImageUpload,
}: FundingInformationProps) {
	return (
		<div className="space-y-4">
			<FormField
				control={control}
				name="previousFunding"
				render={({ field }) => (
					<FormItem>
						<FormLabel> How much have you raised previously?</FormLabel>
						<FormControl>
							<Input {...field} placeholder="An estimate is fine" />
						</FormControl>
						<FormMessage className="font-bold gradient-text" />
						<p className="text-sm text-gray-500 mt-1.5">
							Enter 0 if this is your first fundraising
						</p>
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="fundingGoal"
				render={({ field }) => (
					<FormItem>
						<FormLabel> How much do you want to raise this round?</FormLabel>
						<FormControl>
							<Input {...field} placeholder="Enter funding goal" />
						</FormControl>
						<FormMessage className="font-bold gradient-text" />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="currency"
				render={({ field }) => (
					<FormItem>
						<FormLabel> What currency do you want to accept?</FormLabel>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger className="h-10 bg-background focus:ring-offset-2">
									<SelectValue placeholder="Select a currency" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{CURRENCIES.map((currency) => (
									<SelectItem key={currency.value} value={currency.value}>
										{currency.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage className="font-bold gradient-text" />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="image"
				render={({ field }) => (
					<FormItem>
						<FormLabel> Upload a Project Image</FormLabel>
						<FormControl>
							<div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
								{previewImage ? (
									<div className="text-center w-full">
										<Image
											src={previewImage || '/placeholder.svg'}
											alt="Preview of the project"
											className="mx-auto object-contain mb-4"
											width={800}
											height={400}
										/>
										<button
											type="button"
											onClick={() => setPreviewImage(null)}
											className="text-sm text-red-500 hover:text-red-700"
										>
											Remove image
										</button>
									</div>
								) : (
									<div className="text-center">
										<ImageIcon
											className="mx-auto h-12 w-12 text-gray-300"
											aria-hidden="true"
										/>
										<div className="mt-4 flex items-center text-sm leading-6 text-gray-600">
											<Label
												htmlFor="file-upload"
												className="relative cursor-pointer font-semibold text-black focus-visible:outline-none hover:text-gray-500"
											>
												<span>Click to upload</span>
												<Input
													id="file-upload"
													type="file"
													className="sr-only"
													accept="image/jpeg,image/png,image/gif"
													onChange={async (e) => {
														try {
															await handleImageUpload(e)
														} catch {}
													}}
												/>
											</Label>
											<p className="pl-1">or drag and drop</p>
										</div>
										<p className="text-xs leading-5 text-gray-600">
											PNG, JPG or GIF (max 5MB)
										</p>
									</div>
								)}
							</div>
						</FormControl>
						<FormMessage className="font-bold gradient-text" />
					</FormItem>
				)}
			/>
		</div>
	)
}

const CURRENCIES = [
	{ value: 'USD', label: 'USD' },
	{ value: 'EUR', label: 'EUR' },
	{ value: 'GBP', label: 'GBP' },
	{ value: 'ETH', label: 'ETH' },
] as const
