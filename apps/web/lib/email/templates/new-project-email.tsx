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

interface NewProjectEmailProps {
	recipientName: string
	projectTitle: string
	projectSlug: string
	creatorName?: string
	appUrl: string
	isCreator?: boolean
	isUnderReview?: boolean
}

export function NewProjectEmail({
	recipientName,
	projectTitle,
	projectSlug,
	creatorName,
	appUrl,
	isCreator = false,
	isUnderReview = false,
}: NewProjectEmailProps) {
	const projectUrl = `${appUrl}/projects/${projectSlug}`

	const previewText = isUnderReview
		? `Your project "${projectTitle}" is under review`
		: isCreator
			? `Your project "${projectTitle}" is live on KindFi`
			: `New project "${projectTitle}" needs your support on KindFi`

	return (
		<Html lang="en">
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">
								{isUnderReview
									? 'Your campaign is under review'
									: isCreator
										? 'Your project is live!'
										: 'New project in need'}
							</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi</Text>

							<Text className="text-base leading-6 mb-3">Hi {recipientName},</Text>

							{isUnderReview ? (
								<>
									<Text className="text-base leading-6 mb-3">
										Your campaign <strong>{projectTitle}</strong> has been submitted and is now
										awaiting review by the KindFi admin team.
									</Text>
									<Text className="text-base leading-6 mb-4">
										We will notify you once a decision has been made. In the meantime, you can
										continue editing your campaign from your dashboard.
									</Text>
								</>
							) : isCreator ? (
								<>
									<Text className="text-base leading-6 mb-3">
										Your project <strong>{projectTitle}</strong> has been successfully created on
										KindFi.
									</Text>
									<Text className="text-base leading-6 mb-4">
										You have 7 days to complete your project setup. Add milestones, team members,
										and more to start receiving support.
									</Text>
								</>
							) : (
								<>
									<Text className="text-base leading-6 mb-3">
										{creatorName ? `${creatorName} has launched ` : ''}
										<strong>{projectTitle}</strong> — a project that could use your support.
									</Text>
									<Text className="text-base leading-6 mb-4">
										Be one of the first to discover and support this project on KindFi.
									</Text>
								</>
							)}

							<Button
								href={projectUrl}
								className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
							>
								{isUnderReview
									? 'View your campaign'
									: isCreator
										? 'Complete project setup'
										: 'View project'}
							</Button>

							<Hr className="my-6 border-gray-200" />
							<Text className="text-sm text-gray-500">
								If you did not expect this email, you can safely ignore it.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
