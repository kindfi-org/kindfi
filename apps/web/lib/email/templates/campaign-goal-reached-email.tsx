import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface CampaignGoalReachedEmailProps {
	recipientName: string
	projectTitle: string
	projectSlug: string
	targetAmount: string
	appUrl: string
	isCreator: boolean
}

export function CampaignGoalReachedEmail({
	recipientName,
	projectTitle,
	projectSlug,
	targetAmount,
	appUrl,
	isCreator,
}: CampaignGoalReachedEmailProps) {
	const projectUrl = isCreator
		? `${appUrl}/projects/${projectSlug}/manage`
		: `${appUrl}/projects/${projectSlug}`

	return (
		<Html lang="en">
			<Head />
			<Preview>
				{isCreator
					? `🎯 Your project "${projectTitle}" reached its funding goal!`
					: `Great news! "${projectTitle}" reached its funding goal`}
			</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">
								🎯 Funding goal reached!
							</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi</Text>

							<Text className="text-base leading-6 mb-3">
								Hi {recipientName},
							</Text>

							{isCreator ? (
								<>
									<Text className="text-base leading-6 mb-3">
										Incredible news — your project{' '}
										<strong>{projectTitle}</strong> has reached its funding goal
										of <strong>{targetAmount}</strong>!
									</Text>
									<Text className="text-base leading-6 mb-4">
										Your campaign is now fully funded. Head to your project
										dashboard to review the next steps, manage your milestones,
										and keep your supporters updated.
									</Text>
								</>
							) : (
								<>
									<Text className="text-base leading-6 mb-3">
										A project you support — <strong>{projectTitle}</strong> —
										has reached its funding goal of{' '}
										<strong>{targetAmount}</strong>!
									</Text>
									<Text className="text-base leading-6 mb-4">
										Your contribution helped make this happen. The project team
										will now begin executing their milestones. Stay tuned for
										updates.
									</Text>
								</>
							)}

							<Button
								href={projectUrl}
								className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
							>
								{isCreator ? 'View project dashboard' : 'View project'}
							</Button>

							<Hr className="my-6 border-gray-200" />
							<Text className="text-sm text-gray-500">
								{isCreator
									? 'You are receiving this because you own a project on KindFi.'
									: 'You are receiving this because you contributed to this project on KindFi.'}
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
