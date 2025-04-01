export type ResourceType = "article" | "video" | "guide" | "document"
export type ResourceCategory = "Blockchain" | "Stellar" | "Web3" | "KindFi" | "Impact"
export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced"
export type SortOption = "Most Recent" | "Oldest" | "Most Viewed"

export interface Resource {
  id: string
  type: ResourceType
  category: ResourceCategory
  title: string
  description: string
  timeToConsume: number // in minutes
  level: ExperienceLevel
  tags: string[]
  likes: number
  comments: number
  date: string
  slug: string
}
