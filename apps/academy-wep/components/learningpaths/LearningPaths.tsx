import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { LearningPathsCard } from './LearningPathCard'
import LoadingCard from './LoadingCard'

const ErrorFallback = ({ error }: { error: Error }) => (
	<div role="alert" className="p-4 text-red-600 bg-red-100 rounded">
		<p>Something went wrong:</p>
		<pre className="text-sm">{error.message}</pre>
	</div>
)

const LearningPaths = () => {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		const timeout = setTimeout(() => setIsLoading(false), 1500)
		return () => clearTimeout(timeout)
	}, [])

	return (
		<div className="p-8 bg-white lg:p-14">
			<div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-end">
				<div>
					<div className="px-3 py-1 bg-[#f0f9e8] text-[#7CC635] rounded-full text-sm font-medium mb-4 w-fit">
						<span>Learning Paths</span>
					</div>
					<h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-[#7CC635] bg-clip-text text-transparent">
						Choose Your Learning Journey
					</h2>
				</div>
				<button
					type="button"
					className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-md w-fit"
					aria-label="View All Learning Paths"
					onClick={() => router.push('/learn')}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							router.push('/learn')
						}
					}}
				>
					<span>View All Paths</span>
					<ArrowRight className="h-4" />
				</button>
			</div>

			{isLoading ? (
				<div className="flex flex-col gap-6 lg:flex-row">
					<LoadingCard />
					<LoadingCard />
				</div>
			) : (
				<div className="flex flex-col gap-6 lg:flex-row">
					<ErrorBoundary FallbackComponent={ErrorFallback}>
						<LearningPathsCard
							icon="table2"
							title="Blockchain Fundamentals"
							description="Master the core concepts of blockchain technology and understand how it enables transparent, secure transactions."
							modules={6}
							level="Beginner"
							duration="4 weeks"
							cta="/learn/blockchain-fundamentals"
							ctaColor="green"
						/>
						<LearningPathsCard
							icon="zap"
							title="Impact Crowdfunding"
							description="Discover strategies for creating successful crowdfunding campaigns that leverage blockchain for transparency and trust."
							modules={5}
							level="All Levels"
							duration="3 weeks"
							ctaColor="blue"
							cta="/learn/impact-crowdfunding"
						/>
					</ErrorBoundary>
				</div>
			)}
		</div>
	)
}

export default LearningPaths
