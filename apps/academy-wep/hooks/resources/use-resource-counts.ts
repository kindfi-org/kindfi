import { useMemo } from "react"

import type {
  Resource,
  ResourceCategory,
  ResourceType,
  ExperienceLevel,
} from "~/lib/types/resources.types"

const defaultCategoryCounts: Record<ResourceCategory, number> = {
  Blockchain: 0,
  Stellar: 0,
  Web3: 0,
  KindFi: 0,
  Impact: 0,
}

const defaultTypeCounts: Record<ResourceType, number> = {
  article: 0,
  video: 0,
  guide: 0,
  document: 0,
}

const defaultLevelCounts: Record<ExperienceLevel, number> = {
  Beginner: 0,
  Intermediate: 0,
  Advanced: 0,
}

export const useResourceCounts = (resources: Resource[] = []) => {
  return useMemo(() => {
    if (!resources || resources.length === 0) {
      return {
        categoryCounts: defaultCategoryCounts,
        typeCounts: defaultTypeCounts,
        levelCounts: defaultLevelCounts,
      }
    }

    const categoryCounts = { ...defaultCategoryCounts }
    const typeCounts = { ...defaultTypeCounts }
    const levelCounts = { ...defaultLevelCounts }

    for (const resource of resources) {
      categoryCounts[resource.category]++
      typeCounts[resource.type]++
      levelCounts[resource.level]++
    }

    return { categoryCounts, typeCounts, levelCounts }
  }, [resources])
}
