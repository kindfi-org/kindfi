import { NFTAchievement } from "@/components/achievement/NFTAchievement"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
    <section className="w-full max-w-5xl mx-auto p-6 bg-slate-50 rounded-2xl shadow-sm">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center">
          <Badge className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-100 border-0 flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            <span>Blockchain Achievements</span>
          </Badge>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold md:text-5xl">
          <span className="text-slate-900">NFT Achievement </span>
          <span className="text-green-700">Badges</span>
        </h2>

        {/* Description */}
        <p className="text-slate-700 max-w-2xl text-lg">
          Earn these NFT badges as you complete modules. These badges are stored on the Stellar blockchain and serve as
          proof of your blockchain proficiency.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button className="bg-gradient-to-r from-green-500 to-slate-900 hover:from-green-600 hover:to-slate-800 text-white border-0">
            View Your Collection
          </Button>
          <Button variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-100">
            Learn More About NFTs
          </Button>
        </div>
      </div>
    </section>
    </main>
  )
}
