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

interface MilestoneReviewDecisionEmailProps {
	recipientName: string
	projectTitle: string
	projectSlug: string
	milestoneTitle?: string
	milestoneIndex: number
	decision: 'approved' | 'rejected'
	reviewNotes?: string
	appUrl: string
}

export function MilestoneReviewDecisionEmail({
	recipientName,
	projectTitle,
	projectSlug,
	milestoneTitle,
	milestoneIndex,
	decision,
	reviewNotes,
	appUrl,
}: MilestoneReviewDecisionEmailProps) {
	const milestonesUrl = `${appUrl}/projects/${projectSlug}/manage/milestones`
	const isApproved = decision === 'approved'

	return (
		<Html lang="en">
			<Head />
			<Preview>
				{isApproved ? 'Approved' : 'Rejected'}: milestone review for {projectTitle}
			</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">
								{isApproved ? 'Milestone review approved' : 'Milestone review rejected'}
							</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi</Text>

							<Text className="text-base leading-6 mb-3">Hi {recipientName},</Text>

							<Text className="text-base leading-6 mb-3">
								Your milestone review request for <strong>{projectTitle}</strong> has been{' '}
								{isApproved ? 'approved' : 'rejected'}.
								{milestoneTitle ? (
									<>
										{' '}
										Release {milestoneIndex + 1}: <strong>{milestoneTitle}</strong>
									</>
								) : (
									<> Release {milestoneIndex + 1}.</>
								)}
							</Text>

							{isApproved ? (
								<Text className="text-base leading-6 mb-4">
									An admin will proceed with on-chain milestone approval and fund release through
									the escrow workflow. You will be notified when funds are released.
								</Text>
							) : null}

							{reviewNotes ? (
								<Text className="text-base leading-6 mb-4 rounded-lg bg-gray-50 p-4">
									<strong>Admin notes:</strong> {reviewNotes}
								</Text>
							) : null}

							<Button
								href={milestonesUrl}
								className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
							>
								View milestone status
							</Button>

							<Hr className="my-6 border-gray-200" />
							<Text className="text-sm text-gray-500">
								If you have questions, contact KindFi support.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
