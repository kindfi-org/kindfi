'use client'

import { Feather } from '@expo/vector-icons'
import { MotiView } from 'moti'
import { useState } from 'react'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'
import KindfiLogo from '../../assets/images/kindfi-logo.svg'

interface NavItem {
	label: string
	hasDropdown: boolean
}

export default function MobileNavbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const navItems: NavItem[] = [
		{ label: 'Projects', hasDropdown: true },
		{ label: 'Resources', hasDropdown: true },
		{ label: 'About KindFi', hasDropdown: false },
	]

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen)
	}

	return (
		<View className="absolute top-0 left-0 right-0 z-10">
			{/* Logo and Menu Button */}
			<View className="px-4 pt-6 flex-row items-center justify-between">
				<MotiView
					from={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: 'timing', duration: 600 }}
				>
					<KindfiLogo width={120} height={33} />
				</MotiView>

				<MotiView
					from={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ type: 'timing', duration: 600 }}
				>
					<TouchableOpacity
						className="p-2 rounded-full bg-white shadow-sm"
						onPress={toggleMenu}
						style={{ elevation: 2 }}
					>
						<Feather name="menu" size={22} color="#4CAF50" />
					</TouchableOpacity>
				</MotiView>
			</View>

			{/* Mobile Navigation Menu */}
			<MotiView
				className={isMenuOpen ? 'px-4 mt-2' : 'px-4 mt-2 h-0 overflow-hidden'}
				from={{ height: 0, opacity: 0 }}
				animate={{
					height: isMenuOpen ? 'auto' : 0,
					opacity: isMenuOpen ? 1 : 0,
				}}
				transition={{ type: 'timing', duration: 300 }}
			>
				<View
					className="bg-white rounded-lg p-2 shadow-md"
					style={{ elevation: 4 }}
				>
					{navItems.map((item, index) => (
						<MotiView
							key={item.label.replace(/\s+/g, '-').toLowerCase()}
							from={{ opacity: 0, translateX: -20 }}
							animate={{ opacity: 1, translateX: 0 }}
							transition={{ delay: index * 100, type: 'timing', duration: 300 }}
						>
							<TouchableOpacity
								className="py-3 px-3 flex-row justify-between items-center border-b border-gray-100"
								onPress={toggleMenu}
							>
								<Text className="text-gray-800 font-medium">{item.label}</Text>
								{item.hasDropdown && (
									<Feather name="chevron-down" size={18} color="#4CAF50" />
								)}
							</TouchableOpacity>
						</MotiView>
					))}

					<MotiView
						from={{ opacity: 0, translateY: 10 }}
						animate={{ opacity: 1, translateY: 0 }}
						transition={{ delay: 300, type: 'timing', duration: 300 }}
						className="flex-row justify-between mt-3 pt-2"
					>
						<Pressable className="py-2 px-5 rounded-full border border-gray-300 bg-white">
							<Text className="text-gray-700 font-medium">Sign in</Text>
						</Pressable>

						<Pressable className="py-2 px-5 rounded-full bg-blue-600">
							<Text className="text-white font-medium">Sign up</Text>
						</Pressable>
					</MotiView>
				</View>
			</MotiView>
		</View>
	)
}
