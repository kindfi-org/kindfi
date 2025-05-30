import {
	Feather,
	FontAwesome5,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { AnimatedCharacters, GradientText } from './animated-text'
import { AnimatedTag } from './tags'

export default function HeroSection() {
	return (
		<MotiView
			from={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ type: 'timing', duration: 1000 }}
			style={{ width: '100%' }}
		>
			<View className="px-4 pt-2 pb-8">
				{/* Hero Content */}
				<View className="mb-6">
					{/* Main Headline */}
					<MotiView className="mb-2">
						<AnimatedCharacters
							text="Support What Matters"
							textStyle="text-3xl font-bold text-center text-gray-800"
							delay={300}
							duration={40}
						/>
					</MotiView>

					{/* Subheadline */}
					<MotiView className="mb-4">
						<GradientText
							text="Where Blockchain Meets Real-World Impact"
							textStyle="text-2xl font-bold text-center text-[#41692d]"
							delay={1200}
						/>
					</MotiView>

					{/* Description Text */}
					<MotiView
						from={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ type: 'timing', duration: 800, delay: 1800 }}
						className="mb-6"
					>
						<Text className="text-center text-black">
							KindFi empowers people to support trusted causes around the world
							using the power of stellar blockchain. Every contribution goes
							further with built-in transparency, verified impact, and a
							community that believes giving should be easy, smart, secure, and
							meaningful
						</Text>
					</MotiView>

					{/* CTA Buttons */}
					<View className="flex-row justify-center space-x-4 mb-8">
						<MotiView
							from={{ opacity: 0, translateX: -50 }}
							animate={{ opacity: 1, translateX: 0 }}
							transition={{
								type: 'spring',
								delay: 2200,
								stiffness: 100,
								damping: 15,
							}}
						>
							<Pressable
								className="px-6 py-3 rounded-full"
								style={{ minHeight: 44 }}
								onPress={() => {}}
							>
								<LinearGradient
									colors={['rgb(23, 143, 75)', 'rgb(29, 34, 74)']}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									className="absolute top-0 left-0 right-0 bottom-0 rounded-full"
								/>
								<Text className="text-white font-medium">
									Support with Crypto
								</Text>
							</Pressable>
						</MotiView>

						<MotiView
							from={{ opacity: 0, translateX: 50 }}
							animate={{ opacity: 1, translateX: 0 }}
							transition={{
								type: 'spring',
								delay: 2400,
								stiffness: 100,
								damping: 15,
							}}
						>
							<Pressable
								className="border border-green-500 px-6 py-3 rounded-full"
								style={{ minHeight: 44 }}
								onPress={() => {}}
							>
								<Text className="text-green-500 font-medium">
									Explore Causes
								</Text>
							</Pressable>
						</MotiView>
					</View>

					{/* Tags Section */}
					<MotiView
						from={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ type: 'timing', duration: 600, delay: 2600 }}
						className="px-3"
					>
						{/* All Tags in a wrapping container */}
						<View className="flex-row flex-wrap justify-center gap-2.5">
							<AnimatedTag
								icon={<FontAwesome5 name="users" size={16} color="#2E7D32" />}
								label="Empowering Communities"
								bgColor="#E8F5E9"
								textColor="#2E7D32"
								delay={2700}
							/>
							<AnimatedTag
								icon={<FontAwesome5 name="tree" size={16} color="#2E7D32" />}
								label="Environmental Projects"
								bgColor="#E8F5E9"
								textColor="#2E7D32"
								delay={2800}
							/>
							<AnimatedTag
								icon={<FontAwesome5 name="paw" size={16} color="#D32F2F" />}
								label="Animal Shelters"
								bgColor="#FFEBEE"
								textColor="#D32F2F"
								delay={2900}
							/>
							<AnimatedTag
								icon={
									<Ionicons
										name="newspaper-outline"
										size={16}
										color="#1976D2"
									/>
								}
								label="Community News"
								bgColor="#E3F2FD"
								textColor="#1976D2"
								delay={3000}
							/>
							<AnimatedTag
								icon={
									<FontAwesome5 name="stethoscope" size={16} color="#0097A7" />
								}
								label="Healthcare Support"
								bgColor="#E0F7FA"
								textColor="#0097A7"
								delay={3100}
							/>
							<AnimatedTag
								icon={
									<MaterialIcons name="restaurant" size={16} color="#455A64" />
								}
								label="Food Security"
								bgColor="#ECEFF1"
								textColor="#455A64"
								delay={3200}
							/>
							<AnimatedTag
								icon={<FontAwesome5 name="baby" size={16} color="#7B1FA2" />}
								label="Child Welfare"
								bgColor="#F3E5F5"
								textColor="#7B1FA2"
								delay={3300}
							/>
							<AnimatedTag
								icon={
									<MaterialCommunityIcons
										name="sprout"
										size={16}
										color="#388E3C"
									/>
								}
								label="Sustainable Agriculture"
								bgColor="#E8F5E9"
								textColor="#388E3C"
								delay={3400}
							/>
							<AnimatedTag
								icon={<Feather name="dollar-sign" size={16} color="#1565C0" />}
								label="Social Finance"
								bgColor="#E3F2FD"
								textColor="#1565C0"
								delay={3500}
							/>
							<AnimatedTag
								icon={
									<Ionicons name="school-outline" size={16} color="#673AB7" />
								}
								label="Education for All"
								bgColor="#EDE7F6"
								textColor="#673AB7"
								delay={3600}
							/>
						</View>
					</MotiView>
				</View>
			</View>
		</MotiView>
	)
}
