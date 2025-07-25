import { UpdateCard } from './update-card'

interface LatestUpdatesProps {
	className?: string
}

export function LatestUpdates({ className = '' }: LatestUpdatesProps) {
	const updates = [
		{
			category: 'Technology',
			title: 'New Stellar Smart Contracts Enable Automated Milestone Releases',
			date: 'Feb 15, 2024',
			href: '/updates/stellar-contracts',
		},
		{
			category: 'Milestone',
			title: 'KindFi Reaches $10M in Verified Donations Through Blockchain',
			date: 'Feb 12, 2024',
			href: '/updates/donation-milestone',
		},
		{
			category: 'Industry',
			title: 'Web3 Crowdfunding Adoption Grows 200% in 2024',
			date: 'Feb 10, 2024',
			href: '/updates/adoption-growth',
		},
	]

	return (
		<section className={`py-32 ${className}`}>
			<div className="container">
				{/* Header */}
				<div className="text-center mb-20">
					<h2 className="text-4xl font-bold mb-4">Latest Updates</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Stay informed about the latest developments in Web3 crowdfunding.
					</p>
				</div>

				{/* Updates Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{updates.map((update, _index) => (
						<UpdateCard
							key={update.href}
							category={update.category}
							title={update.title}
							date={update.date}
							href={update.href}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
