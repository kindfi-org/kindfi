import { HR } from '@expo/html-elements'
import {
	Building,
	Building2,
	ChevronDown,
	ChevronUp,
	CircleCheck,
	Download,
	Factory,
	FileText,
	StretchHorizontal,
} from 'lucide-react-native'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const DropdownSection = ({ title, items }) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<View className="border border-gray-200 p-4">
			<TouchableOpacity
				className="flex-row justify-between items-center"
				onPress={() => setIsOpen(!isOpen)}
			>
				<Text className="text-lg font-medium">{title}</Text>
				{isOpen ? (
					<ChevronUp size={20} color="#6b7280" />
				) : (
					<ChevronDown size={20} color="#6b7280" />
				)}
			</TouchableOpacity>

			{isOpen && (
				<View className="mt-3">
					{items.map((item, index) => (
						<View
							key={index}
							className={`py-2 ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}
						>
							<Text className="text-gray-600">{item.label}</Text>
							<Text className="font-bold mt-1">{item.value}</Text>
						</View>
					))}
				</View>
			)}
		</View>
	)
}

export default function Details() {
	const items = [
		'Environmental impact of mining and disposing of battery materials',
		'Performance degradation over time in chemical batteries',
		'Limited cycle life of conventional batteries',
		'Safety concerns with thermal runaway in lithium-ion systems',
		'Supply chain vulnerabilities for rare earth materials',
	]

	const items2 = [
		'Increasing renewable energy penetration requiring storage solutions',
		'Growing demand for grid stability and resilience',
		'Rising electricity costs driving behind-the-meter storage adoption',
		'Corporate sustainability commitments and ESG requirements',
		'Government incentives and policies supporting clean energy storage',
	]

	const items3 = [
		'Energy density of 200 Wh/kg (comparable to lithium-ion)',
		'Power density of 1000 W/kg (5x higher than lithium-ion)',
		'100,000+ full charge cycles with zero degradation',
		'Operating temperature range of -40°C to +85°C',
		'Expected lifetime of 30+ years',
	]

	const valuationItems = [
		{ label: 'Pre-money valuation', value: '$12M' },
		{ label: 'Post-money valuation', value: '$13.5M' },
	]

	const minInvestmentItems = [
		{ label: 'Minimum investment amount', value: '$10,000' },
	]

	const securityTypeItems = [
		{
			label:
				'SAFE (Simple Agreement for Future Equity) with a valuation cap of $12M and no discount.',
		},
	]

	const investorPerksItems = [
		{ label: 'Quarterly investor updates' },
		{ label: 'Early access to product demos' },
		{ label: 'Invitation to annual investor summit' },
	]

	return (
		<View className="mt-4">
			<Text className="font-extrabold mb-1">Detailed Project Information</Text>

			<View className="mb-6">
				<Text className="text-lg font-bold mb-4">Project Overview</Text>
				<Text className="text-gray-600">
					Qnetic is developing a revolutionary mechanical battery technology
					that stores energy through kinetic motion rather than chemical
					reactions. Our patented flywheel-based system achieves energy
					densities comparable to lithium-ion batteries but with zero
					degradation over time, unlimited charge cycles, and no rare earth
					materials or toxic chemicals.
				</Text>
			</View>

			<View className="mb-6">
				<Text className="font-extrabold mb-1">Project Description</Text>
				<Text className="text-gray-600 bg-gray-50 rounded p-6">
					At Qnetic, we're addressing one of the most critical challenges in the
					renewable energy transition: efficient, sustainable energy storage.
					Our innovative mechanical battery technology represents a paradigm
					shift in how we think about storing and deploying energy. The core of
					our technology is a high-performance flywheel system that stores
					energy kinetically rather than chemically. By using advanced composite
					materials and magnetic bearings, we've created a system that achieves
					energy densities comparable to lithium-ion batteries but without the
					environmental drawbacks or performance degradation. Our solution
					addresses several critical pain points in the current energy storage
					market:
					{items.map((item, index) => (
						<View key={index} style={{ flexDirection: 'row', marginTop: 8 }}>
							<Text style={{ marginRight: 8 }}>•</Text>
							<Text style={{ fontSize: 16 }}>{item}</Text>
						</View>
					))}
				</Text>
			</View>

			<HR />

			<View className="mb-6 mt-6">
				<Text className="font-extrabold mb-1">Business Model</Text>
				<Text className="text-gray-600 mb-4">
					Our business model is based on manufacturing and selling energy
					storage systems, with a focus on the following revenue streams:
				</Text>

				<View className="flex-col space-y-4">
					<View className="w-full bg-gray-50 p-4 rounded-lg">
						<View className="flex-row items-start">
							<View className="border border-blue-200 rounded-full p-2 mr-3 bg-blue-50">
								<StretchHorizontal className="text-blue-500" size={20} />
							</View>
							<View className="flex-1">
								<Text className="font-bold text-lg mb-1">Data Centers</Text>
								<Text className="text-gray-600">
									Uninterruptible power supply with lower TCO than traditional
									battery systems.
								</Text>
							</View>
						</View>
					</View>

					<View className="w-full bg-gray-50 p-4 rounded-lg">
						<View className="flex-row items-start">
							<View className="border border-green-200 rounded-full p-2 mr-3 bg-green-50">
								<Building2 className="text-green-500" size={20} />
							</View>
							<View className="flex-1">
								<Text className="font-bold text-lg mb-1">Utilities</Text>
								<Text className="text-gray-600">
									Grid-scale energy storage for renewable energy integration and
									frequency regulation.
								</Text>
							</View>
						</View>
					</View>

					<View className="w-full bg-gray-50 p-4 rounded-lg">
						<View className="flex-row items-start">
							<View className="border border-yellow-200 rounded-full p-2 mr-3 bg-yellow-50">
								<Factory className="text-yellow-500" size={20} />
							</View>
							<View className="flex-1">
								<Text className="font-bold text-lg mb-1">Manufacturing</Text>
								<Text className="text-gray-600">
									Energy storage to reduce peak demand charges and provide
									backup power.
								</Text>
							</View>
						</View>
					</View>

					<View className="w-full bg-gray-50 p-4 rounded-lg">
						<View className="flex-row items-start">
							<View className="border border-purple-200 rounded-full p-2 mr-3 bg-purple-50">
								<Building className="text-purple-500" size={20} />
							</View>
							<View className="flex-1">
								<Text className="font-bold text-lg mb-1">
									Commercial Buildings
								</Text>
								<Text className="text-gray-600">
									Behind-the-meter storage for demand charge reduction and
									emergency backup.
								</Text>
							</View>
						</View>
					</View>
				</View>
			</View>

			<HR />

			<View className="mb-6 mt-6">
				<Text className="font-extrabold mb-1">Market Opportunity</Text>
				<Text className="text-black">
					The global energy storage market is projected to grow from $211
					billion in 2022 to $413 billion by 2030, with a CAGR of 8.7%. Key
					drivers include:
					{items2.map((item, index) => (
						<View key={index} style={{ flexDirection: 'row', marginTop: 8 }}>
							<Text style={{ marginRight: 8 }}>•</Text>
							<Text style={{ fontSize: 16 }}>{item}</Text>
						</View>
					))}
				</Text>
			</View>

			<HR />

			<View className="mb-6 mt-6">
				<Text className="font-extrabold mb-1">Technology</Text>
				<Text className="text-gray-600">
					Our proprietary flywheel technology uses advanced composite materials
					and magnetic bearings to achieve:
					{items3.map((item, index) => (
						<View key={index} style={{ flexDirection: 'row', marginTop: 8 }}>
							<Text style={{ marginRight: 8 }}>•</Text>
							<Text style={{ fontSize: 16 }}>{item}</Text>
						</View>
					))}
				</Text>
				<View className="mb-6 mt-6">
					<Text className="font-extrabold mb-4">Competitive Advantages</Text>

					<View className="flex-row items-start mb-3">
						<CircleCheck className="text-green-500 mr-2 mt-1" size={20} />
						<View className="flex-1">
							<Text className="font-bold">Zero Degradation:</Text>
							<Text className="text-gray-600">
								Unlike lithium-ion batteries that lose capacity over time, our
								system maintains 100% capacity throughout its lifetime.
							</Text>
						</View>
					</View>

					<View className="flex-row items-start mb-3">
						<CircleCheck className="text-green-500 mr-2 mt-1" size={20} />
						<View className="flex-1">
							<Text className="font-bold">Sustainable Materials:</Text>
							<Text className="text-gray-600">
								No rare earth elements, toxic chemicals, or conflict minerals.
							</Text>
						</View>
					</View>

					<View className="flex-row items-start mb-3">
						<CircleCheck className="text-green-500 mr-2 mt-1" size={20} />
						<View className="flex-1">
							<Text className="font-bold">Safety:</Text>
							<Text className="text-gray-600">
								No risk of thermal runaway, fire, or explosion.
							</Text>
						</View>
					</View>

					<View className="flex-row items-start">
						<CircleCheck className="text-green-500 mr-2 mt-1" size={20} />
						<View className="flex-1">
							<Text className="font-bold">Lower TCO:</Text>
							<Text className="text-gray-600">
								40% lower total cost of ownership over 10 years compared to
								lithium-ion.
							</Text>
						</View>
					</View>
				</View>
			</View>

			<HR />

			<View className="mb-6 mt-6 px-4">
				<Text className="font-extrabold mb-4 text-xl">
					Traction & Milestones
				</Text>

				<View className="relative">
					{/* Blue vertical line - centered behind the buttons */}
					<View className="absolute left-6 top-0 bottom-0 w-1 bg-blue-300 z-0" />

					{/* STEP 1 */}
					<View className="flex-row items-start mb-10 relative z-[-1]">
						<View className="absolute left-1 top-3 w-10 h-10 rounded-full bg-blue-500 items-center justify-center z-20">
							<Text className="text-white font-bold">1</Text>
						</View>
						<View className="flex-1 pl-16">
							<Text className="font-bold text-lg mb-1">
								Q2 2022: Proof of Concept
							</Text>
							<Text className="text-gray-600">
								Successfully demonstrated 5kWh prototype with energy density of
								150 Wh/kg.
							</Text>
						</View>
					</View>

					{/* STEP 2 */}
					<View className="flex-row items-start mb-10 relative z-[-1]">
						<View className="absolute left-1 top-3 w-10 h-10 rounded-full bg-blue-500 items-center justify-center z-20">
							<Text className="text-white font-bold">2</Text>
						</View>
						<View className="flex-1 pl-16">
							<Text className="font-bold text-lg mb-1">
								Q4 2022: Seed Funding
							</Text>
							<Text className="text-gray-600">
								Raised $2.1M from Clean Energy Ventures and angel investors.
							</Text>
						</View>
					</View>

					{/* STEP 3 */}
					<View className="flex-row items-start mb-10 relative z-[-1]">
						<View className="absolute left-1 top-3 w-10 h-10 rounded-full bg-blue-500 items-center justify-center z-20">
							<Text className="text-white font-bold">3</Text>
						</View>
						<View className="flex-1 pl-16">
							<Text className="font-bold text-lg mb-1">
								Q2 2023: 40% Scale Prototype
							</Text>
							<Text className="text-gray-600">
								Completed 20kWh system with improved energy density of 200
								Wh/kg.
							</Text>
						</View>
					</View>

					{/* STEP 4 */}
					<View className="flex-row items-start mb-10 relative z-[-1]">
						<View className="absolute left-1 top-3 w-10 h-10 rounded-full bg-blue-500 items-center justify-center z-20">
							<Text className="text-white font-bold">4</Text>
						</View>
						<View className="flex-1 pl-16">
							<Text className="font-bold text-lg mb-1">
								Q4 2023: First Customer LOIs
							</Text>
							<Text className="text-gray-600">
								Secured $110M in Letters of Intent from data center operators
								and utilities.
							</Text>
						</View>
					</View>

					{/* STEP 5 */}
					<View className="flex-row items-start relative z-[-1]">
						<View className="absolute left-1 top-3 w-10 h-10 rounded-full bg-blue-400 items-center justify-center z-20">
							<Text className="text-white font-bold">5</Text>
						</View>
						<View className="flex-1 pl-16">
							<Text className="font-bold text-lg mb-1">
								Q3 2024: Full-Scale Prototype{' '}
								<Text className="text-sm italic text-gray-500">
									(In Progress)
								</Text>
							</Text>
							<Text className="text-gray-600">
								100kWh commercial-ready system for pilot installations.
							</Text>
						</View>
					</View>
				</View>
			</View>

			<HR />

			<View className="mb-8">
				<Text className="text-2xl font-bold mb-4">Investment Details</Text>

				<DropdownSection title="Valuation" items={valuationItems} />
				<DropdownSection
					title="Minimum Investment"
					items={minInvestmentItems}
				/>
				<DropdownSection title="Security Type" items={securityTypeItems} />
				<DropdownSection title="Investor Perks" items={investorPerksItems} />
			</View>

			<View className="border border-gray-200 rounded-lg p-4">
				<Text className="text-xl font-bold mb-3">Documents</Text>

				<View className="border-b border-gray-100 pb-3 mb-3">
					<TouchableOpacity className="flex-row justify-between items-center">
						<FileText className="text-gray-600" />
						<Text className="text-gray-600">SPV Subscription Agreement</Text>
						<Download size={16} color="#6b7280" />
					</TouchableOpacity>
				</View>

				<View className="border-b border-gray-100 pb-3 mb-3">
					<TouchableOpacity className="flex-row justify-between items-center">
						<FileText className="text-gray-600" />
						<Text className="text-gray-600">SAFE Agreement</Text>
						<Download size={16} color="#6b7280" />
					</TouchableOpacity>
				</View>

				<View>
					<TouchableOpacity className="flex-row justify-between items-center">
						<FileText className="text-gray-600" />
						<Text className="text-gray-600">Pitch Deck</Text>
						<Download size={16} color="#6b7280" />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}
