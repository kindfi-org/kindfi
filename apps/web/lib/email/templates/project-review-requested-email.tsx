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

interface ProjectReviewRequestedEmailProps {
	recipientName: string
	projectTitle: string
	projectSlug: string
	creatorName?: string
	submittedAt: string
	appUrl: string
}

export function ProjectReviewRequestedEmail({
	recipientName,
	projectTitle,
	projectSlug,
	creatorName,
	submittedAt,
	appUrl,
}: ProjectReviewRequestedEmailProps) {
	const reviewQueueUrl = `${appUrl}/admin/projects`

	return (
		<Html lang="en">
			<Head />
			<Preview>{`New campaign ready for review: ${projectTitle}`}</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">Campaign review requested</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi Admin</Text>

							<Text className="text-base leading-6 mb-3">Hi {recipientName},</Text>

							<Text className="text-base leading-6 mb-3">
								{creatorName ? <strong>{creatorName}</strong> : 'A creator'} submitted the campaign{' '}
								<strong>{projectTitle}</strong> for review on {submittedAt}. Please review it and
								either activate or reject the campaign.
							</Text>

							<Button
								href={reviewQueueUrl}
								className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
							>
								Open campaign review queue
							</Button>

							<Hr className="my-6 border-gray-200" />
							<Text className="text-sm text-gray-500">
								Campaign: {projectTitle} ({projectSlug})
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
