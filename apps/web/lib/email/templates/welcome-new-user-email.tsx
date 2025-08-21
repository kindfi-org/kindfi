import {
	Body,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface WelcomeNewUserEmailProps {
	displayName: string
	hasKyc: boolean
}

export function WelcomeNewUserEmail({
	displayName,
	hasKyc,
}: WelcomeNewUserEmailProps) {
	const badgeStyle = hasKyc
		? { backgroundColor: '#E6F4EA', color: '#166534' } // green-ish
		: { backgroundColor: '#FEF3C7', color: '#92400E' } // amber-ish

	const badgeLabel = hasKyc ? 'KYC completed' : 'KYC pending'

	return (
		<Html>
			<Head />
			<Preview>Welcome, ${displayName}!</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="bg-white rounded-2xl p-8 shadow">
							{/* Header */}
							<Text className="text-2xl font-semibold mb-1">
								Welcome, {displayName}!
							</Text>
							<Text className="text-sm text-gray-500 mb-4">KindFi</Text>

							{/* Status badge */}
							<div
								style={{
									display: 'inline-block',
									padding: '6px 10px',
									borderRadius: 999,
									fontSize: 12,
									fontWeight: 600,
									lineHeight: 1,
									...badgeStyle,
								}}
							>
								{badgeLabel}
							</div>

							{/* Body copy */}
							{hasKyc ? (
								<>
									<Text className="text-base leading-6 mt-6 mb-3">
										Your verification is complete — you now have full access to{' '}
										<strong>KindFi</strong>.
									</Text>
									<Text className="text-base leading-6 mb-2">
										You can create projects, earn NFTs for participation and
										achievements and use all available features without limits
										tied to identity verification.
									</Text>
									<Text className="text-sm text-gray-500 mt-6">
										If you did not request this, you can safely ignore this
										message.
									</Text>
								</>
							) : (
								<>
									<Text className="text-base leading-6 mt-6 mb-3">
										You&apos;re in — with limited access for now.
									</Text>
									<Text className="text-base leading-6 mb-2">
										Some features remain locked until you complete KYC. This may
										include higher limits or actions that require identity
										verification.
									</Text>
									<Text className="text-base leading-6 mb-2">
										You can still browse around and set up your profile. When
										you’re ready, complete verification to unlock everything in{' '}
										<strong>KindFi</strong>.
									</Text>
									<Text className="text-sm text-gray-500 mt-6">
										If you did not request this, you can safely ignore this
										message.
									</Text>
								</>
							)}
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
