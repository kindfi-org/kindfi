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

interface MilestoneReviewRequestedEmailProps {
	recipientName: string
	projectTitle: string
	projectSlug: string
	milestoneTitle?: string
	milestoneIndex: number
	requesterName?: string
	requestNotes?: string
	appUrl: string
}

export function MilestoneReviewRequestedEmail({
	recipientName,
	projectTitle,
	projectSlug,
	milestoneTitle,
	milestoneIndex,
	requesterName,
	requestNotes,
	appUrl,
}: MilestoneReviewRequestedEmailProps) {
	const reviewQueueUrl = `${appUrl}/admin/milestone-reviews`

	return (
		<Html lang="en">
			<Head />
			<Preview>{`${projectTitle} — Release ${milestoneIndex + 1} is ready for review`}</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">Milestone review requested</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi Admin</Text>

							<Text className="text-base leading-6 mb-3">Hi {recipientName},</Text>

							<Text className="text-base leading-6 mb-3">
								{requesterName ? <strong>{requesterName}</strong> : 'A project owner'} submitted a
								milestone review request for <strong>{projectTitle}</strong>.
								{milestoneTitle ? (
									<>
										{' '}
										Release {milestoneIndex + 1}: <strong>{milestoneTitle}</strong>
									</>
								) : (
									<> Release {milestoneIndex + 1} is ready for your review.</>
								)}
							</Text>

							{requestNotes ? (
								<Text className="text-base leading-6 mb-4 rounded-lg bg-gray-50 p-4 italic">
									"{requestNotes}"
								</Text>
							) : null}

							<Button
								href={reviewQueueUrl}
								className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
							>
								Open review queue
							</Button>

							<Hr className="my-6 border-gray-200" />
							<Text className="text-sm text-gray-500">
								Project: {projectTitle} ({projectSlug})
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
