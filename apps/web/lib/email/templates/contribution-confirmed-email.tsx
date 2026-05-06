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

interface ContributionConfirmedEmailProps {
	recipientName: string
	projectTitle: string
	projectSlug: string
	amount: string
	appUrl: string
}

export function ContributionConfirmedEmail({
	recipientName,
	projectTitle,
	projectSlug,
	amount,
	appUrl,
}: ContributionConfirmedEmailProps) {
	const projectUrl = `${appUrl}/projects/${projectSlug}`

	return (
		<Html lang="en">
			<Head />
			<Preview>
				Thank you! Your contribution of {amount} to {projectTitle} is confirmed.
			</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">
								💙 Thank you for your support
							</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi</Text>

							<Text className="text-base leading-6 mb-3">
								Hi {recipientName},
							</Text>

							<Text className="text-base leading-6 mb-3">
								Your contribution of <strong>{amount}</strong> to{' '}
								<strong>{projectTitle}</strong> has been confirmed. You are making
								a real difference!
							</Text>

							<Text className="text-base leading-6 mb-4">
								You will receive updates as the project reaches milestones and
								achieves its goals. We'll keep you in the loop every step of the
								way.
							</Text>

							<Button
								href={projectUrl}
								className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
							>
								View project
							</Button>

							<Hr className="my-6 border-gray-200" />
							<Text className="text-sm text-gray-500">
								You are receiving this because you made a contribution on KindFi.
								If you did not expect this email, please contact KindFi support.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
