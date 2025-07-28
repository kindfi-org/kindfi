/** biome-ignore-all lint/correctness/useHookAtTopLevel: any */
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { MotiView } from 'moti'
import { Controller, useForm } from 'react-hook-form'
import { Platform, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'
import InputField from '@/components/forms/input-field'
import StepHeader from '@/components/forms/step-header'
import StepNavigation from '@/components/forms/step-navigation'
import { Box } from '@/components/ui/box'

const Step3Schema = z.object({
	projectSupportReason: z
		.string()
		.min(20, 'Long description must be at least 20 characters'),
	fundUsage: z.string().min(10, 'How funds will be used is required'),
})

type Step3FormData = z.infer<typeof Step3Schema>
const Step3Summary = () => {
	const isiOS = Platform.OS === 'ios'
	const paddingTop = isiOS
		? useSafeAreaInsets().top * 2
		: useSafeAreaInsets().top + 20

	const _router = useRouter()
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<Step3FormData>({
		resolver: zodResolver(Step3Schema),
		defaultValues: {
			projectSupportReason: '',
			fundUsage: '',
		},
	})

	const onSubmit = (data: Step3FormData) => {
		console.log('Form Data:', data)
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
							name="projectSupportReason"
							render={({ field }) => (
								<InputField
									textArea
									label="Why Should people support your project?"
									placeHolder="Tell us about your project’s mission and impact..."
									infoText="Long description must be at least 20 characters"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={!!errors?.projectSupportReason}
									errorMessage={errors.projectSupportReason?.message}
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
							name="fundUsage"
							render={({ field }) => (
								<InputField
									textArea
									className=" mt-8"
									label="How will the funds be used?"
									infoText="How will the funds be used?"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={!!errors?.fundUsage}
									errorMessage={errors.fundUsage?.message}
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

export default Step3Summary
