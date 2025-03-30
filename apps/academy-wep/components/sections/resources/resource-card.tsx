"use client"

import { useRouter } from "next/navigation"
import { cva } from "class-variance-authority"
import { ThumbsUp, MessageSquare } from "lucide-react"

import type { ExperienceLevel, ResourceCategory, ResourceType } from "~/lib/types/resources.types"
import { Badge } from "~/components/base/badge"
import { Button } from "~/components/base/button"
import { Card, CardContent, CardFooter, CardHeader } from "~/components/base/card"
import { getTypeIcon } from "~/lib/utils/resources/get-type-icon"

interface ResourceCardProps {
  type: ResourceType
  category: ResourceCategory
  title: string
  description: string
  timeToConsume: number
  level: ExperienceLevel
  tags: string[]
  likes: number
  comments: number
  date: string
  slug: string
}

// Get the appropriate type badge style
const typeVariants = cva('rounded-full', {
  variants: {
    type: {
      article: 'bg-blue-600 hover:bg-blue-500 text-white',
      video: 'bg-red-600 hover:bg-red-500 text-white',
      guide: 'bg-green-600 hover:bg-green-500 text-white',
      document: 'bg-gray-600 hover:bg-gray-500 text-white',
    },
  },
  defaultVariants: {
    type: 'article',
  },
})

export function ResourceCard({
  type,
  category,
  title,
  description,
  timeToConsume,
  level,
  likes,
  comments,
  slug,
}: ResourceCardProps) {
  const router = useRouter()

  // Get the appropriate time label based on resource type
  const getTimeLabel = () => {
    switch (type) {
      case "video":
        return "min watch"
      default:
        return "min read"
    }
  }

  return (
    <Card className="group bg-white overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow p-6 pb-0">
      <CardHeader className="-p-6">
        {/* Type and Category */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={typeVariants({ type })}>
            {type}
          </Badge>
          <span className="text-muted-foreground text-xs font-medium">
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
      </CardHeader>

      {/* Metadata and Actions */}
      <CardContent className="-p-6 flex-grow">
        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{description}</p>

        {/* Reading Time and Level */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center font-medium">
            {getTypeIcon(type)}
            <span>
              {timeToConsume} {getTimeLabel()}
            </span>
          </div>
          <Badge variant="outline" className="bg-gray-100 text-muted-foreground border-none">
            {level}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="-p-6 py-4 border-t mt-auto">
        {/* Engagement and View Button */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4 font-medium">
            <div className="flex items-center text-muted-foreground text-sm">
              <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
              <span>{likes}</span>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              <span>{comments}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-gray-800 bg-white hover:text-primary hover:bg-white border-gray-200 hover:border-primary"
            onClick={() => router.push(`/resources/${slug}`)}
          >
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
