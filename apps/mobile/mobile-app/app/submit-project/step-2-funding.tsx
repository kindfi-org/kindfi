import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { MotiView } from 'moti'
import { Controller, useForm } from 'react-hook-form'
import { Platform, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'
import CurrencyDropdown from '@/components/forms/cureency-dropdown'
import InputField from '@/components/forms/input-field'
import StepHeader from '@/components/forms/step-header'
import StepNavigation from '@/components/forms/step-navigation'
import UploadImage from '@/components/forms/upload-image'
import { Box } from '@/components/ui/box'

const Step2Schema = z.object({
	amountRaised: z
		.string()
		.transform((val) => Number(val))
		.refine((val) => !Number.isNaN(val), { message: 'Enter a valid number' }),

	fundingGoal: z
		.string()
		.transform((val) => Number(val))
		.refine((val) => val > 0, {
			message: 'Funding goal must be greater than 0',
		}),

	currency: z.string().min(1, 'Currency is required'),
	projectImage: z.string().min(1, 'Project image is required'),
})

type Step2FormData = z.infer<typeof Step2Schema>
const Step2Funding = () => {
	const isiOS = Platform.OS === 'ios'
	const paddingTop = isiOS
		? useSafeAreaInsets().top * 2
		: useSafeAreaInsets().top + 20

	const router = useRouter()
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<Step2FormData>({
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		resolver: zodResolver(Step2Schema) as any,
		defaultValues: {
			amountRaised: 0,
			fundingGoal: 0,
			currency: '',
			projectImage: '',
		},
	})

	const onSubmit = (data: Step2FormData) => {
		console.log('Form Data', data)
		router.push('/submit-project/step-3-summary')
	}

	return (
		<>
			<ScrollView
				contentContainerStyle={{
					alignItems: 'center',
					justifyContent: 'flex-start',
					flexGrow: 1,
					paddingTop: paddingTop,
					backgroundColor: '#F4F6FB',
					paddingHorizontal: 24,
					paddingBottom: 40,
				}}
			>
				<StepHeader />

				<Box className="w-full bg-white  rounded-lg py-8 px-6 mt-10   ">
					<MotiView
						from={{ opacity: 0, translateY: 20 }}
						animate={{ opacity: 1, translateY: 0 }}
						transition={{ type: 'timing', duration: 400 }}
					>
						<Controller
							control={control}
							name="amountRaised"
							render={({ field }) => (
								<InputField
									keyboardType="number-pad"
									label="How much have you raised previously?"
									placeHolder="An estimate is fine"
									value={field.value.toLocaleString()}
									onChange={field.onChange}
									onBlur={field.onBlur}
									error={!!errors.amountRaised}
									errorMessage={errors.amountRaised?.message}
									infoText="Enter 0 if this is your first fundraising"
								/>
							)}
						/>
					</MotiView>
					<MotiView
						from={{ opacity: 0, translateY: 20 }}
						animate={{ opacity: 1, translateY: 0 }}
						transition={{ type: 'timing', duration: 400 }}
					>
						<Controller
							control={control}
							name="fundingGoal"
							render={({ field }) => (
								<InputField
									className="mt-8"
									keyboardType="number-pad"
									label="How much do you want to raise this round?"
									placeHolder="Enter funding goal"
									value={field.value.toLocaleString()}
									onChange={field.onChange}
									onBlur={field.onBlur}
									error={!!errors.fundingGoal}
									errorMessage={errors.fundingGoal?.message}
								/>
							)}
						/>
					</MotiView>
					<MotiView
						from={{ opacity: 0, translateY: 20 }}
						animate={{ opacity: 1, translateY: 0 }}
						transition={{ type: 'timing', duration: 400 }}
					>
						<Controller
							control={control}
							name="currency"
							render={({ field }) => (
								<CurrencyDropdown
									className="mt-8"
									label="What currency do you want to accept?"
									value={field.value}
									onChange={field.onChange}
									error={!!errors.currency}
									errorMessage={errors.currency?.message}
								/>
							)}
						/>
					</MotiView>
					<MotiView
						from={{ opacity: 0, translateY: 20 }}
						animate={{ opacity: 1, translateY: 0 }}
						transition={{ type: 'timing', duration: 400 }}
					>
						<Controller
							control={control}
							name="projectImage"
							render={({ field }) => (
								<UploadImage
									error={!!errors.projectImage}
									errorMessage={errors.projectImage?.message}
									onChange={(image) => {
										field.onChange(image)
									}}
								/>
							)}
						/>
					</MotiView>

					<StepNavigation onhandleNext={handleSubmit(onSubmit)} />
				</Box>
			</ScrollView>
			<StatusBar backgroundColor="#F4F6FB" style="light" />
		</>
	)
}

export default Step2Funding
