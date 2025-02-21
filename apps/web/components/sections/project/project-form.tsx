/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { useMultiStepForm } from '../../../hooks/use-multi-step-form'
import {
	type ProjectFormData,
	projectFormSchema,
	step1Fields,
	step2Fields,
	step3Fields,
} from '../../../lib/validators/project'

// Define constants before component
const FORM_STEPS = [
	{ number: 1, label: 'Project Details' },
	{ number: 2, label: 'Funding Information' },
	{ number: 3, label: 'Additional Details' },
] as const

const CATEGORIES = [
	{ value: 'environment', label: 'Environment' },
	{ value: 'education', label: 'Education' },
	{ value: 'healthcare', label: 'Healthcare' },
	{ value: 'technology', label: 'Technology' },
	{ value: 'community', label: 'Community' },
	{ value: 'arts', label: 'Arts' },
] as const

const CURRENCIES = [
	{ value: 'USD', label: 'USD' },
	{ value: 'EUR', label: 'EUR' },
	{ value: 'GBP', label: 'GBP' },
	{ value: 'ETH', label: 'ETH' },
] as const

const FIELDS_TO_VALIDATE = {
	1: step1Fields,
	2: step2Fields,
	3: step3Fields,
} as const

export default function ProjectForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		trigger,
	} = useForm<ProjectFormData>({
		resolver: zodResolver(projectFormSchema),
		mode: 'onChange',
	})

	const {
		step,
		previewImage,
		handleImageUpload,
		handleNext,
		setStep,
		setPreviewImage,
		error: imageError,
	} = useMultiStepForm({
		totalSteps: FORM_STEPS.length,
		trigger,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		steps: FORM_STEPS as any,
		fieldsToValidate: FIELDS_TO_VALIDATE,
	})

	const onSubmit = (data: ProjectFormData) => {
		console.log(data)
		// Handle form submission
	}

	const renderFormStep = () => {
		// Hide all other steps except the current one
		const style = { display: step === 1 ? 'block' : 'none' }
		const style2 = { display: step === 2 ? 'block' : 'none' }
		const style3 = { display: step === 3 ? 'block' : 'none' }

		return (
			<>
				<div style={style} className="space-y-4">
					{/* Step 1 fields */}
					<div>
						<label
							htmlFor="website"
							className="block text-sm font-medium text-gray-900 mb-1.5"
						>
							What&apos;s your project&apos;s website?
						</label>
						<input
							type="text"
							id="website"
							{...register('website')}
							placeholder="https://"
							className={`w-full px-3 py-2 rounded-md border ${
								errors.website ? 'border-red-500' : 'border-gray-200'
							} placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-black focus:ring-offset-1`}
						/>
						{errors.website && (
							<p className="text-sm text-red-500 mt-1">
								{errors.website.message}
							</p>
						)}
						<p className="text-sm text-gray-500 mt-1.5">
							Optional: Add your project website if you have one
						</p>
					</div>

					<div>
						<label
							htmlFor="location"
							className="block text-sm font-medium text-gray-900 mb-1.5"
						>
							Where is your project based?
						</label>
						<input
							type="text"
							id="location"
							{...register('location')}
							placeholder="Enter location"
							className={`w-full px-3 py-2 rounded-md border ${
								errors.location ? 'border-red-500' : 'border-gray-200'
							} placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-black focus:ring-offset-1`}
						/>
						{errors.location && (
							<p className="text-sm text-red-500 mt-1">
								{errors.location.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="category"
							className="block text-sm font-medium text-gray-900 mb-1.5"
						>
							How would you categorize your project?
						</label>
						<div className="relative">
							<select
								id="category"
								{...register('category')}
								className={`w-full px-3 py-2 rounded-md border ${
									errors.category ? 'border-red-500' : 'border-gray-200'
								} bg-white appearance-none focus:outline-none focus:ring-2 
                focus:ring-black focus:ring-offset-1`}
							>
								<option value="">Select a category</option>
								{CATEGORIES.map((category) => (
									<option key={category.value} value={category.value}>
										{category.label}
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
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>
						{errors.category && (
							<p className="text-sm text-red-500 mt-1">
								{errors.category.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-900 mb-1.5"
						>
							Describe your project in simple words
						</label>
						<input
							type="text"
							id="description"
							{...register('description')}
							placeholder="e.g., Providing clean water for rural communities"
							className={`w-full px-3 py-2 rounded-md border ${
								errors.description ? 'border-red-500' : 'border-gray-200'
							} placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-black focus:ring-offset-1`}
						/>
						{errors.description && (
							<p className="text-sm text-red-500 mt-1">
								{errors.description.message}
							</p>
						)}
					</div>
				</div>

				<div style={style2} className="space-y-4">
					{/* Step 2 fields */}
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
							} placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-black focus:ring-offset-1`}
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
							} placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-black focus:ring-offset-1`}
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
								} bg-white appearance-none focus:outline-none focus:ring-2 
                focus:ring-black focus:ring-offset-1`}
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
							<p className="text-sm text-red-500 mt-1">
								{errors.currency.message}
							</p>
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

				<div style={style3} className="space-y-4">
					{/* Step 3 fields */}
					<div>
						<label
							htmlFor="projectSupport"
							className="block text-sm font-medium text-red-500 mb-1.5"
						>
							Why should people support your project?
						</label>
						<textarea
							id="projectSupport"
							{...register('projectSupport')}
							placeholder="Tell us about your project's mission and impact..."
							rows={4}
							className={`w-full px-3 py-2 rounded-md border ${
								errors.projectSupport ? 'border-red-500' : 'border-gray-200'
							} placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-black focus:ring-offset-1 resize-none`}
						/>
						{errors.projectSupport ? (
							<p className="text-sm text-red-500 mt-1">
								{errors.projectSupport.message}
							</p>
						) : (
							<p className="text-sm text-red-500 mt-1.5">
								Long description must be at least 20 characters.
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="fundUsage"
							className="block text-sm font-medium text-red-500 mb-1.5"
						>
							How will the funds be used?
						</label>
						<textarea
							id="fundUsage"
							{...register('fundUsage')}
							placeholder="Provide a detailed breakdown of fund allocation..."
							rows={4}
							className={`w-full px-3 py-2 rounded-md border ${
								errors.fundUsage ? 'border-red-500' : 'border-gray-200'
							} placeholder:text-gray-500 focus:outline-none focus:ring-2 
              focus:ring-black focus:ring-offset-1 resize-none`}
						/>
						{errors.fundUsage ? (
							<p className="text-sm text-red-500 mt-1">
								{errors.fundUsage.message}
							</p>
						) : (
							<p className="text-sm text-red-500 mt-1.5">
								Fund usage must be at least 20 characters.
							</p>
						)}
					</div>
				</div>
			</>
		)
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="mx-auto max-w-2xl px-4 py-8"
		>
			<div className="text-center mb-8">
				<button
					type="button"
					className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors mb-8"
				>
					Create Project
				</button>
				<h1 className="text-4xl font-bold mb-4">
					Let&apos;s get your KindFi project started
				</h1>
				<p className="text-gray-500 text-lg">
					Create a crowdfunding campaign and make an impact with the power of
					Web3 transparency.
				</p>
			</div>

			{/* Steps indicator */}
			<div className="flex justify-between mb-8 relative">
				<div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200" />
				{FORM_STEPS.map((s) => (
					<div
						key={s.number}
						className="relative flex flex-col items-center gap-2 z-10"
					>
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${
									s.number < step
										? 'bg-black text-white'
										: s.number === step
											? 'bg-black text-white'
											: 'bg-gray-100 text-gray-500'
								}`}
						>
							{s.number < step ? <Check className="h-4 w-4" /> : s.number}
						</div>
						<span
							className={`text-sm ${step === s.number ? 'text-black font-medium' : 'text-gray-500'}`}
						>
							{s.label}
						</span>
						{step === s.number && (
							<div className="absolute -bottom-2 w-full h-0.5 bg-black" />
						)}
					</div>
				))}
			</div>

			<div className="bg-white border border-gray-200 rounded-lg shadow-md">
				<div className="p-6">
					<div className="space-y-8">
						{renderFormStep()}

						<div className="flex justify-between pt-4">
							<button
								type="button"
								onClick={() => setStep(Math.max(1, step - 1))}
								disabled={step === 1}
								className="flex items-center px-4 py-2 border border-gray-200 
                  rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 
                  disabled:cursor-not-allowed"
							>
								<ChevronLeft className="w-4 h-4 mr-2" />
								Previous
							</button>
							{step === 3 ? (
								<button
									type="submit"
									className="flex items-center px-4 py-2 bg-black text-white 
                    rounded-md hover:bg-black/90 transition-colors"
								>
									<Check className="w-4 h-4 mr-2" />
									Submit for Review
								</button>
							) : (
								<button
									type="button"
									onClick={handleNext}
									className="flex items-center px-4 py-2 bg-black text-white 
                    rounded-md hover:bg-black/90 transition-colors"
								>
									Next
									<ChevronRight className="w-4 h-4 ml-2" />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}
