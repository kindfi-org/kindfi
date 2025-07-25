import { useLocalSearchParams } from 'expo-router'
import { useRef } from 'react'
import { ScrollView, View } from 'react-native'
import Animated from 'react-native-reanimated'
import FundingPanel from '@/components/project-details/funding-panel'
import Gallery from '@/components/project-details/gallery'
import ProjectHeader from '@/components/project-details/header'
import RelatedProjects from '@/components/project-details/related-projects'
import SharePanel from '@/components/project-details/share-panel'
import StickyCTA from '@/components/project-details/sticky-cta'
import Details from '@/components/project-details/tab-content/details'
import Overview from '@/components/project-details/tab-content/overview'
import QnA from '@/components/project-details/tab-content/qna'
import Team from '@/components/project-details/tab-content/team'
import Updates from '@/components/project-details/tab-content/updates'
import TabNav from '@/components/project-details/tab-nav'
import Tags from '@/components/project-details/tags'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

export default function ProjectDetailScreen() {
	const scrollRef = useRef(null)
	const { tab = 'overview' } = useLocalSearchParams()

	const renderTabContent = () => {
		switch (tab) {
			case 'details':
				return <Details />
			case 'team':
				return <Team />
			case 'updates':
				return <Updates />
			case 'qna':
				return <QnA />
			default:
				return <Overview />
		}
	}

	return (
		<View className="flex-1 bg-blue-50">
			<AnimatedScrollView
				ref={scrollRef}
				scrollEventThrottle={16}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsHorizontalScrollIndicator={false}
				horizontal={false}
			>
				{/* Header Section */}
				<View className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-100">
					<ProjectHeader />
					<View className="px-4 pb-4">
						<Tags />
					</View>
				</View>

				{/* Gallery Section */}
				<View className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
					<Gallery />
				</View>

				{/* Main Content Section */}
				<View className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-100">
					<View className="px-4 pt-4">
						<TabNav />
					</View>
					<View className="px-4 pb-4">{renderTabContent()}</View>
				</View>

				{/* Funding Panel Section */}
				<View className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-100">
					<View className="px-4 py-4">
						<FundingPanel />
					</View>
				</View>

				{/* Share Panel Section */}
				<View className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-100">
					<View className="px-4 py-4">
						<SharePanel />
					</View>
				</View>

				{/* Related Projects Section */}
				<View className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-100">
					<View className="px-4 py-4">
						<RelatedProjects />
					</View>
				</View>
			</AnimatedScrollView>

			<StickyCTA scrollRef={scrollRef} />
		</View>
	)
}
