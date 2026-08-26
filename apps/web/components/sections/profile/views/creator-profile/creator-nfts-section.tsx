import { Trophy } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'

const NFTCollection = dynamic(
	() =>
		import('~/components/sections/gamification/nft-collection').then((mod) => ({
			default: mod.NFTCollection,
		})),
	{
		loading: () => null,
		ssr: false,
	},
)

export function CreatorNftsSection() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Trophy className="h-5 w-5 text-primary" />
					NFT Collection
				</CardTitle>
			</CardHeader>
			<CardContent>
				<NFTCollection />
			</CardContent>
		</Card>
	)
}
