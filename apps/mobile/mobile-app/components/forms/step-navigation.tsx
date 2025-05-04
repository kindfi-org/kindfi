import { usePathname, useRouter } from 'expo-router'
import { CheckIcon, ChevronLeft, ChevronRight } from 'lucide-react-native'
import { MotiView } from 'moti'
import type { FC } from 'react'
import { Button, ButtonIcon, ButtonText } from '../ui/button'
import { HStack } from '../ui/hstack'

const steps = [
	{ label: 'Project Details', path: '/submit-project/step-1-details' },
	{ label: 'Funding Information', path: '/submit-project/step-2-funding' },
	{ label: 'Additional Details', path: '/submit-project/step-3-summary' },
]

interface StepNavigationProps {
	onhandleNext: () => void
}

const StepNavigation: FC<StepNavigationProps> = ({ onhandleNext }) => {
	const router = useRouter()
	const pathname = usePathname()

	const currentStepIndex = steps.findIndex((step) =>
		pathname.includes(step.path),
	)

	const isFirstStep = currentStepIndex === 0
	const isLastStep = currentStepIndex === steps.length - 1

	const goToStep = (index: number) => {
		const step = steps[index]
		if (step) {
			router.push(step.path as never)
		}
	}

	const handleNext = () => {
		onhandleNext()
	}

	const handlePrev = () => {
		if (!isFirstStep) {
			goToStep(currentStepIndex - 1)
		}
	}

	return (
		<MotiView
			from={{ opacity: 0, translateY: 20 }}
			animate={{ opacity: 1, translateY: 0 }}
			transition={{ type: 'timing', duration: 500 }}
		>
			<HStack className="w-full mt-12 items-center justify-between">
				<Button
					disabled={isFirstStep}
					onPress={handlePrev}
					className="w-96 rounded-lg bg-[#F4F6FB] border-[#5970A6]"
				>
					<ButtonIcon color="#000000" as={ChevronLeft} />
					<ButtonText className="font-normal text-sm text-black">
						Previous
					</ButtonText>
				</Button>

				<Button
					onPress={handleNext}
					className="w-96 rounded-lg border-[#5970A6]"
					style={{ backgroundColor: '#00133E' }}
				>
					{isLastStep && <ButtonIcon color="#ffffff" as={CheckIcon} />}
					<ButtonText className="text-sm font-normal text-white">
						{isLastStep ? 'Submit for Review' : 'Next'}
					</ButtonText>
					{!isLastStep && <ButtonIcon color="#ffffff" as={ChevronRight} />}
				</Button>
			</HStack>
		</MotiView>
	)
}

export default StepNavigation
