'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'

interface InvestorQuote {
	text: string
}

interface Investor {
	id: string
	name: string
	bio: string
	avatar: string
	initials: string
	isPrincipal?: boolean
	quote?: InvestorQuote
	profileUrl?: string
}

const investors: Investor[] = [
	{
		id: 'jonh-anderson',
		name: 'John Anderson',
		bio: 'Angel investor with a background in corporate leadership and a passion for sustainable innovation.',
		avatar: '/placeholder.svg?height=80&width=80',
		initials: 'PI',
		isPrincipal: true,
		quote: {
			text: "I was initially attracted to Qnetic because of its focus on clean energy. What really convinced me to invest, however, was the team. The combined experience of Mike, Malcolm, Loic, and Mathias—all at high levels in the corporate world before moving into entrepreneurship—really impressed me. When people with that kind of background come together with a shared vision, it's a strong indicator of success.\n\nOn top of that, I think the product is awesome. They have understood the nuances of the problem and arrived at a stand-out solution. Lithium mining and chemical batteries are big contradictions in the green energy space, but Qnetic offers a genuine alternative. They're serious about making green energy truly sustainable, and that's what sets them apart. With the right financing, I believe this team can accomplish great things.",
		},
		profileUrl: '/investors/john-anderson',
	},
	{
		id: 'russell-murphy',
		name: 'Russell Murphy',
		bio: 'Investor and former startup lawyer.',
		avatar: '/placeholder.svg?height=60&width=60',
		initials: 'RM',
		quote: {
			text: "It's a very exciting technology for our future generation. I made this investment for my children.",
		},
		profileUrl: '/investors/russell-murphy',
	},
	{
		id: 'david-keiser',
		name: 'David Keiser',
		bio: 'Co-founder of highly successful biopharmaceutical company',
		avatar: '/placeholder.svg?height=60&width=60',
		initials: 'DK',
		quote: {
			text: 'The ability to store energy generated through renewable sources is the most significant challenge facing us today.',
		},
		profileUrl: '/investors/david-keiser',
	},
]

export function LeadInvestors() {
	const principalInvestor = investors.find((investor) => investor.isPrincipal)
	const otherInvestors = investors.filter((investor) => !investor.isPrincipal)

	return (
		<div className="space-y-6 mt-10">
			<h2 className="text-3xl font-bold">Lead Investors</h2>

			{principalInvestor && (
				<Card className="border-gray-200 hover:border-gray-300 transition-colors">
					<CardContent className="p-6">
						<div className="flex flex-col md:flex-row gap-6">
							<Avatar className="h-16 w-16">
								<AvatarImage
									src={principalInvestor.avatar}
									alt={principalInvestor.name}
								/>
								<AvatarFallback>{principalInvestor.initials}</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<Badge
									variant="outline"
									className="bg-green-100 text-green-800 border-none uppercase font-bold hover:bg-green-200"
								>
									Principal Investor
								</Badge>
								<div className="space-y-2">
									<h3 className="font-bold text-lg">
										{principalInvestor.name}
									</h3>
									<p className="text-gray-700">{principalInvestor.bio}</p>
									{principalInvestor.quote && (
										<div className="bg-gray-200 p-4 text-gray-600 rounded-md italic mt-4 whitespace-pre-line">
											{principalInvestor.quote.text}
										</div>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{otherInvestors.map((investor) => (
					<Link
						key={investor.id}
						href={investor.profileUrl || '#'}
						className="block"
					>
						<Card className="h-full border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
							<CardContent className="p-6">
								<div className="flex gap-4">
									<Avatar className="h-16 w-16">
										<AvatarImage src={investor.avatar} alt={investor.name} />
										<AvatarFallback>{investor.initials}</AvatarFallback>
									</Avatar>
									<div className="space-y-2">
										<h3 className="font-bold text-lg">{investor.name}</h3>
										<p className="text-gray-600">{investor.bio}</p>
										{investor.quote && (
											<div className="bg-gray-200 p-4 text-gray-600 rounded-md italic mt-4">
												{investor.quote.text}
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
