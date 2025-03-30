"use client"
import type React from "react"
import { Button } from '../base/button'
import { Badge } from "../base/badge"
// import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"

// RORO pattern: Props as a single object
type NFTAchievementProps = {
  options?: {
    badge?: {
      text: string
      icon?: React.ReactNode
    }
    title?: {
      main: string
      highlighted: string
    }
    description?: string
    buttons?: {
      primary: {
        text: string
        onClick?: ({ event }: { event: React.MouseEvent }) => void
      }
      secondary: {
        text: string
        onClick?: ({ event }: { event: React.MouseEvent }) => void
      }
    }
  }
}

export function NFTAchievement({ options = {} }: NFTAchievementProps) {
  // Default values following RORO pattern
  const {
    badge = {
      text: "Blockchain Achievements",
      icon: <Award className="h-4 w-4" />,
    },
    title = {
      main: "NFT Achievement",
      highlighted: "Badges",
    },
    description = "Earn these NFT badges as you complete modules. These badges are stored on the Stellar blockchain and serve as proof of your blockchain proficiency.",
    buttons = {
      primary: {
        text: "View Your Collection",
        onClick: ({ event }: { event: React.MouseEvent }) => console.log("View collection clicked", event),
      },
      secondary: {
        text: "Learn More About NFTs",
        onClick: ({ event }: { event: React.MouseEvent }) => console.log("Learn more clicked", event),
      },
    },
  } = options

  // RORO pattern for event handlers
  const handlePrimaryClick = ({ event }: { event: React.MouseEvent }) => {
    buttons.primary.onClick?.({ event })
  }

  const handleSecondaryClick = ({ event }: { event: React.MouseEvent }) => {
    buttons.secondary.onClick?.({ event })
  }

  return (
    <section className="w-full mx-auto p-6 bg-slate-50 rounded-2xl shadow-sm">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Badge with icon */}
        <div className="inline-flex items-center">
          <Badge className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-100 border-0 flex items-center gap-1.5">
            {badge.icon}
            <span>{badge.text}</span>
          </Badge>
        </div>

        {/* Title with styled parts */}
        <h2 className="text-4xl font-bold md:text-5xl">
          <span className="text-slate-900">{title.main} </span>
          <span className="text-green-700">{title.highlighted}</span>
        </h2>

        {/* Description */}
        <p className="text-slate-700 max-w-2xl text-lg">{description}</p>

        {/* CTA Buttons - horizontally aligned and responsive */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={(event) => handlePrimaryClick({ event })}
            className="bg-gradient-to-r from-green-500 to-slate-900 hover:from-green-600 hover:to-slate-800 text-white border-0"
          >
            {buttons.primary.text}
          </Button>
          <Button
            variant="outline"
            onClick={(event) => handleSecondaryClick({ event })}
            className="border-slate-300 text-slate-800 hover:bg-slate-100"
          >
            {buttons.secondary.text}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default NFTAchievement

