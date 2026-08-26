import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface SignupVerificationEmailProps {
	otp: string
}

export function SignupVerificationEmail({ otp }: SignupVerificationEmailProps) {
	return (
		<Html lang="en">
			<Head />
			<Preview>Your KindFi verification code</Preview>
			<Tailwind>
				<Body className="bg-gray-50 text-gray-900">
					<Container className="mx-auto my-8 w-full max-w-[560px]">
						<Section className="rounded-2xl bg-white p-8 shadow">
							<Text className="mb-1 text-sm text-gray-500">KindFi</Text>
							<Text className="mb-3 text-2xl font-semibold">Confirm your account</Text>
							<Text className="mb-4 text-base leading-6">
								Enter this verification code to finish setting up your KindFi account:
							</Text>
							<Text className="my-6 text-center text-3xl font-bold tracking-[0.3em]">{otp}</Text>
							<Text className="text-sm text-gray-500">
								This code expires in 1 hour. If you did not request this, you can safely ignore this
								email.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
