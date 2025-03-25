import { IoBookOutline } from 'react-icons/io5'
import { IoShieldOutline } from 'react-icons/io5'
import { IoPeopleOutline } from 'react-icons/io5'
import { FeatureCard } from './feature-card'

const FeaturesOverview: React.FC = () => {
	return (
		<div className="bg-slate-150 py-16 px-4 w-full">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-gray-700 font-medium mb-4">
						Why Choose KindFi Academy
					</h2>
					<h1 className="text-4xl font-bold mb-4">
						Learn Skills That Drive{' '}
						<span className="text-green-600">Real Impact</span>
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Our curriculum is designed specifically for social impact projects,
						combining technical knowledge with practical applications.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<FeatureCard
						icon={<IoBookOutline size={32} className="text-green-500" />}
						title="Interactive"
						titleHighlight="Curriculum"
						titleColor="green"
						description="Learn blockchain fundamentals through hands-on exercises, interactive simulations, and real-world Stellar blockchain examples."
						ctaText="Explore Curriculum"
						ctaLink="#"
					/>

					<FeatureCard
						icon={<IoShieldOutline size={32} className="text-blue-500" />}
						title="Stellar NFT"
						titleHighlight="Badges"
						titleColor="blue"
						description="Earn verifiable credentials on the Stellar blockchain as you complete modules, showcasing your expertise with immutable proof."
						ctaText="View Badge Gallery"
						ctaLink="#"
					/>

					<FeatureCard
						icon={<IoPeopleOutline size={32} className="text-purple-500" />}
						title="Impact"
						titleHighlight="Community"
						titleColor="purple"
						description="Connect with a global network of changemakers using Stellar blockchain technology to drive social and environmental impact projects."
						ctaText="Join Our Community"
						ctaLink="#"
					/>
				</div>
			</div>
		</div>
	)
}

export default FeaturesOverview