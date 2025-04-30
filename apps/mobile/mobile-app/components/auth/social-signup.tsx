import { Button, HStack, Text, VStack } from '@gluestack-ui/themed'
import { Motion } from '@legendapp/motion'
import { AppleIcon, Github, LogIn } from 'lucide-react-native'
import type React from 'react'

type SocialProvider = 'google' | 'apple' | 'github'

export const SocialSignup: React.FC = () => {
	const handleSocialSignup = (provider: SocialProvider) => {
		// TODO: Implement social auth logic
		console.log(`Signing up with ${provider}`)
	}

	return (
		<Motion.View
			className="p-4"
			initial={{ opacity: 0, translateY: 20 }}
			animate={{ opacity: 1, translateY: 0 }}
			transition={{ type: 'spring' }}
		>
			<VStack gap={16}>
				<VStack gap={8}>
					<Text className="text-2xl font-bold text-gray-100">
						Ready to Empower Projects?
					</Text>
					<Text className="text-gray-300">
						Join the revolution of Web3 impact creators and help shape the
						future of sustainable development.
					</Text>
				</VStack>

				<VStack gap={8} className="mt-4">
					<Button
						className="w-full bg-white"
						onPress={() => handleSocialSignup('google')}
					>
						<HStack gap={8} alignItems="center">
							<LogIn size={20} />
							<Text>Continue with Google</Text>
						</HStack>
					</Button>

					<Button
						className="w-full bg-black"
						onPress={() => handleSocialSignup('apple')}
					>
						<HStack gap={8} alignItems="center">
							<AppleIcon size={20} />
							<Text className="text-white">Continue with Apple</Text>
						</HStack>
					</Button>

					<Button
						className="w-full bg-gray-800"
						onPress={() => handleSocialSignup('github')}
					>
						<HStack gap={8} alignItems="center">
							<Github size={20} />
							<Text className="text-white">Continue with GitHub</Text>
						</HStack>
					</Button>
				</VStack>
			</VStack>
		</Motion.View>
	)
}
