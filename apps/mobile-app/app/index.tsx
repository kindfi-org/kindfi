import Gradient from '@/assets/Icons/Gradient'
import Logo from '@/assets/Icons/Logo'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'
import { ScrollView } from 'react-native'

export default function Home() {
	return (
		<Box className="flex-1 bg-black h-[100vh]">
			<ScrollView
				style={{ height: '100%' }}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<Box className="absolute h-[500px] w-[500px] lg:w-[700px] lg:h-[700px]">
					<Gradient />
				</Box>
				<Box className="flex items-center flex-1 mx-5 my-16 lg:my-24 lg:mx-32">
					<Box className="gap-10 base:flex-col sm:flex-row justify-between sm:w-[80%] md:flex-1">
						<Box className="items-center px-6 py-2 rounded-full bg-background-template flex-column md:flex-row md:self-start">
							<Text className="font-normal text-typography-white">
								Get started by editing
							</Text>
							<Text className="ml-2 font-medium text-typography-white">
								./App.tsx
							</Text>
						</Box>
						<Link href="/tabs">
							<Box className="items-center px-6 py-2 rounded-full bg-background-template flex-column sm:flex-row md:self-start">
								<Text className="font-normal text-typography-white">
									Explore Tab Navigation
								</Text>
							</Box>
						</Link>
					</Box>
					<Box className="flex-1 justify-center items-center h-[20px] w-[300px] lg:h-[160px] lg:w-[400px]">
						<Logo />
					</Box>
				</Box>
			</ScrollView>
		</Box>
	)
}
