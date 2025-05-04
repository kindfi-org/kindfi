import DocumentData from '@/assets/Icons/DocumentData'
import Gradient from '@/assets/Icons/Gradient'
import LightBulbPerson from '@/assets/Icons/LightbulbPerson'
import Logo from '@/assets/Icons/Logo'
import Rocket from '@/assets/Icons/Rocket'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
/* eslint-disable import/no-unresolved */
import React from 'react'
import { ScrollView } from 'react-native'

import { Link } from 'expo-router'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const FeatureCard = ({ iconSvg: IconSvg, name, desc }: any) => {
	return (
		<Box
			className="p-4 m-2 border rounded flex-column border-w-1 border-outline-700 md:flex-1"
			key={name}
		>
			<Box className="flex flex-row items-center">
				<Text>
					<IconSvg />
				</Text>
				<Text className="ml-2 text-xl font-medium text-typography-white">
					{name}
				</Text>
			</Box>
			<Text className="mt-2 text-typography-400">{desc}</Text>
		</Box>
	)
}

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
						<Link href="/submit-project">
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

					<Box className="flex-column md:flex-row">
						<FeatureCard
							iconSvg={DocumentData}
							name="Docs"
							desc="Find in-depth information about gluestack features and API."
						/>
						<FeatureCard
							iconSvg={LightBulbPerson}
							name="Learn"
							desc="Learn about gluestack in an interactive course with quizzes!"
						/>
						<FeatureCard
							iconSvg={Rocket}
							name="Deploy"
							desc="Instantly drop your gluestack site to a shareable URL with vercel."
						/>
					</Box>
				</Box>
			</ScrollView>
		</Box>
	)
}
