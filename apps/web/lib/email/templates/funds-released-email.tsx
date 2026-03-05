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

interface FundsReleasedEmailProps {
	recipientName: string
	projectTitle: string
	projectSlug: string
	amount?: string
	appUrl: string
}

export function FundsReleasedEmail({
	recipientName,
	projectTitle,
	projectSlug,
	amount,
	appUrl,
}: FundsReleasedEmailProps) {
	const projectUrl = `${appUrl}/projects/${projectSlug}/manage`

	return (
		<Html lang="en">
			<Head />
			<Preview>
				Funds released for {projectTitle} — payment confirmed
			</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							<Text className="text-2xl font-semibold mb-1">
								💰 Funds released
							</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi</Text>

							<Text className="text-base leading-6 mb-3">
								Hi {recipientName},
							</Text>

							<Text className="text-base leading-6 mb-3">
								Your escrow funds for <strong>{projectTitle}</strong> have been
								successfully released and confirmed on-chain.
								{amount ? (
									<>
										{' '}
										The amount of <strong>{amount}</strong> is now available.
									</>
								) : (
									<> The funds are now available in your account.</>
								)}
							</Text>

							<Text className="text-base leading-6 mb-4">
								You can view the transaction details and manage your project from
								your dashboard.
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
