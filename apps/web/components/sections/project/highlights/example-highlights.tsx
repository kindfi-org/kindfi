import {
	IoSparklesOutline,
	IoStarOutline,
	IoTrendingUpOutline,
} from 'react-icons/io5'
import { Card } from '~/components/base/card'
import { ExampleHighlightCard } from './example-highlight-card'

export function ExampleHighlights() {
	return (
		<Card className="bg-white p-6 border-none shadow-lg">
			<h3 className="text-xl font-semibold mb-6 md:mb-8">Example Highlights</h3>
			<div className="space-y-6">
				<ExampleHighlightCard
					icon={<IoStarOutline className="text-black" size={22} />}
					title="Key Achievement"
					description="Successfully completed pilot program with 1,000+ users"
				/>
				<ExampleHighlightCard
					icon={<IoTrendingUpOutline className="text-black" size={22} />}
					title="Growth Metric"
					description="300% user growth in the last quarter"
				/>
				<ExampleHighlightCard
					icon={<IoSparklesOutline className="text-black" size={18} />}
					title="Unique Value"
					description="First-to-market solution for sustainable energy storage"
				/>
			</div>
		</Card>
	)
}
