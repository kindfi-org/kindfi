import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ProjectFormData } from '~/lib/validators/project'

type FundingInformationProps = {
	register: UseFormRegister<ProjectFormData>
	errors: FieldErrors<ProjectFormData>
	previewImage: string | null
	setPreviewImage: (image: string | null) => void
	handleImageUpload: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => Promise<void>
	imageError: string | null
}

export function FundingInformation({
	register,
	errors,
	setPreviewImage,
	previewImage,
	handleImageUpload,
	imageError,
}: FundingInformationProps) {
	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="previousFunding"
					className="block text-sm font-medium text-gray-900 mb-1.5"
				>
					How much have you raised previously?
				</label>
				<input
					type="text"
					id="previousFunding"
					{...register('previousFunding')}
					placeholder="An estimate is fine"
					className={`w-full px-3 py-2 rounded-md border ${
						errors.previousFunding ? 'border-red-500' : 'border-gray-200'
					} placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
				/>
				{errors.previousFunding && (
					<p className="text-sm text-red-500 mt-1">
						{errors.previousFunding.message}
					</p>
				)}
				<p className="text-sm text-gray-500 mt-1.5">
					Enter 0 if this is your first fundraising
				</p>
			</div>

			<div>
				<label
					htmlFor="fundingGoal"
					className="block text-sm font-medium text-gray-900 mb-1.5"
				>
					How much do you want to raise this round?
				</label>
				<input
					type="text"
					id="fundingGoal"
					{...register('fundingGoal')}
					placeholder="Enter funding goal"
					className={`w-full px-3 py-2 rounded-md border ${
						errors.fundingGoal ? 'border-red-500' : 'border-gray-200'
					} placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
				/>
				{errors.fundingGoal && (
					<p className="text-sm text-red-500 mt-1">
						{errors.fundingGoal.message}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor="currency"
					className="block text-sm font-medium text-gray-900 mb-1.5"
				>
					What currency do you want to accept?
				</label>
				<div className="relative">
					<select
						id="currency"
						{...register('currency')}
						className={`w-full px-3 py-2 rounded-md border ${
							errors.currency ? 'border-red-500' : 'border-gray-200'
						} bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
					>
						<option value="">Select a currency</option>
						{CURRENCIES.map((currency) => (
							<option key={currency.value} value={currency.value}>
								{currency.label}
							</option>
						))}
					</select>
					<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
						<svg
							aria-label="Dropdown icon"
							role="img"
							className="h-4 w-4 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Dropdown icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</div>
				{errors.currency && (
					<p className="text-sm text-red-500 mt-1">{errors.currency.message}</p>
				)}
			</div>

			<div>
				<label
					htmlFor="file-upload"
					className="block text-sm font-medium text-gray-900 mb-1.5"
				>
					Upload a Project Image
				</label>
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
							<div className="mt-4 flex text-sm leading-6 text-gray-600">
								<label
									htmlFor="file-upload"
									className="relative cursor-pointer rounded-md font-semibold text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 hover:text-gray-500"
								>
									<span>Click to upload</span>
									<input
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
								</label>
								<p className="pl-1">or drag and drop</p>
							</div>
							<p className="text-xs leading-5 text-gray-600">
								PNG, JPG or GIF (max 5MB)
							</p>
							{imageError && (
								<p className="text-sm text-red-500 mt-2">{imageError}</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

const CURRENCIES = [
	{ value: 'USD', label: 'USD' },
	{ value: 'EUR', label: 'EUR' },
	{ value: 'GBP', label: 'GBP' },
	{ value: 'ETH', label: 'ETH' },
] as const
