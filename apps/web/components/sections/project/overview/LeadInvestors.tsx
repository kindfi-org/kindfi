'use client'

import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import { investors } from '~/lib/mock-data/project/mock-overview-section'

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
										<div className="bg-gray-200/30 p-4 text-gray-600 rounded-md italic mt-4 whitespace-pre-line">
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
											<div className="bg-gray-200/30 p-4 text-gray-600 rounded-md italic mt-4">
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
