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

interface MilestoneApprovedEmailProps {
	recipientName: string
	projectTitle: string
	projectSlug: string
	milestoneTitle?: string
	milestoneIndex?: number
	appUrl: string
}

export function MilestoneApprovedEmail({
	recipientName,
	projectTitle,
	projectSlug,
	milestoneTitle,
	milestoneIndex = 0,
	appUrl,
}: MilestoneApprovedEmailProps) {
	const projectUrl = `${appUrl}/projects/${projectSlug}/manage`

	return (
		<Html lang="en">
			<Head />
			<Preview>
				Milestone approved for {projectTitle} — funds are being released
			</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">
								✅ Milestone approved
							</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi</Text>

							<Text className="text-base leading-6 mb-3">
								Hi {recipientName},
							</Text>

							<Text className="text-base leading-6 mb-3">
								Great news! A milestone for your project{' '}
								<strong>{projectTitle}</strong> has been approved.
								{milestoneTitle ? (
									<>
										{' '}
										<strong>{milestoneTitle}</strong> (Milestone{' '}
										{milestoneIndex + 1}) is now complete.
									</>
								) : (
									<> Milestone {milestoneIndex + 1} is now complete.</>
								)}
							</Text>

							<Text className="text-base leading-6 mb-4">
								The funds for this milestone are being released to your escrow.
								You can track the transaction and manage your project from your
								dashboard.
							</Text>

							<Button
								href={projectUrl}
								className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
							>
								View project dashboard
							</Button>

							<Hr className="my-6 border-gray-200" />
							<Text className="text-sm text-gray-500">
								If you did not expect this email, please contact KindFi support.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
