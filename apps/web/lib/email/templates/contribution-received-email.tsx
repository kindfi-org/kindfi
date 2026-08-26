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

interface ContributionReceivedEmailProps {
	recipientName: string
	contributorName?: string
	projectTitle: string
	projectSlug: string
	amount: string
	appUrl: string
}

export function ContributionReceivedEmail({
	recipientName,
	contributorName,
	projectTitle,
	projectSlug,
	amount,
	appUrl,
}: ContributionReceivedEmailProps) {
	const projectUrl = `${appUrl}/projects/${projectSlug}/manage`

	return (
		<Html lang="en">
			<Head />
			<Preview>
				{contributorName
					? `${contributorName} just contributed ${amount} to ${projectTitle}`
					: `New contribution of ${amount} received for ${projectTitle}`}
			</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">🎉 New contribution received</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi</Text>

							<Text className="text-base leading-6 mb-3">Hi {recipientName},</Text>

							<Text className="text-base leading-6 mb-3">
								{contributorName ? (
									<>
										<strong>{contributorName}</strong> just contributed <strong>{amount}</strong> to
										your project <strong>{projectTitle}</strong>.
									</>
								) : (
									<>
										Your project <strong>{projectTitle}</strong> received a new contribution of{' '}
										<strong>{amount}</strong>.
									</>
								)}
							</Text>

							<Text className="text-base leading-6 mb-4">
								Keep up the great work — every contribution brings you closer to your goal. Visit
								your project dashboard to see your progress.
							</Text>

							<Button
								href={projectUrl}
								className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
							>
								View project dashboard
							</Button>

							<Hr className="my-6 border-gray-200" />
							<Text className="text-sm text-gray-500">
								You are receiving this because you own a project on KindFi.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
