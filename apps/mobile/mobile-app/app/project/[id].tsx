import { View, ScrollView } from 'react-native';
import { useRef } from 'react';
import ProjectHeader from '@/components/project-detail/header';
import Gallery from '@/components/project-detail/gallery';
import Tags from '@/components/project-detail/tags';
import FundingPanel from '@/components/project-detail/funding-panel';
import TabNav from '@/components/project-detail/tab-nav';
import SharePanel from '@/components/project-detail/share-panel';
import RelatedProjects from '@/components/project-detail/related-projects';
import StickyCTA from '@/components/project-detail/sticky-cta';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import Overview from '@/components/project-detail/tab-content/overview';
import QnA from '@/components/project-detail/tab-content/qna';
import Details from '@/components/project-detail/tab-content/details';
import Team from '@/components/project-detail/tab-content/team';
import Updates from '@/components/project-detail/tab-content/updates';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function ProjectDetailScreen() {
    const scrollRef = useRef(null);
    const { tab = 'overview' } = useLocalSearchParams();

    const renderTabContent = () => {
        switch (tab) {
            case 'details':
                return <Details />;
            case 'team':
                return <Team />;
            case 'updates':
                return <Updates />;
            case 'qna':
                return <QnA />;
            default:
                return <Overview />;
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
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
                    <View className="px-4 pb-4">
                        {renderTabContent()}
                    </View>
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
    );
}