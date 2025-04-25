import { Award } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'

export function NFTAchievement() {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-white to-green-50/60 space-y-5 py-14 max-w-4xl mx-auto rounded-2xl p-8 sm:p-10 shadow-sm">
      <div className="flex justify-center">
        <Badge className="px-4 py-2 rounded-full shadow-none bg-[#f0f9e8] hover:bg-green-50/80 text-[#7CC635] gap-1">
          <Award className="size-5" />
          <span>Blockchain Achievements</span>
        </Badge>
      </div>

      <h2 className="text-center text-3xl font-bold">
        <span className="text-gray-900"> NFT Achievement</span>
        <span className="gradient-text !bg-gradient-to-r"> Badges</span>
      </h2>
      <p className="text-center text-lg text-gray-700 max-w-xl mx-auto">
        Earn these NFT badges as you complete modules. These badges are stored
        on the Stellar blockchain and serve as proof of your blockchain
        proficiency.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2 w-full sm:w-auto">
        <Button
          variant="secondary"
          className="gradient-btn"
          aria-label="View your NFT badge collection"
        >
          View Your Collection
        </Button>
        <Button
          variant="outline"
          className="hover:text-green-600 border-gray-300"
          aria-label="Learn more about NFT badges"
        >
          Learn More About NFTs
        </Button>
      </div>
    </div>
  )
}
