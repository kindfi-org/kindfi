"use client";

import { AchievementProgressProps } from "~/lib/types/learn/nft-achievement.types";
import { calculateProgress } from "~/lib/utils/nft-achievement-utils";

export function NFTAchievementProgress({
  totalBadges,
  earnedBadges,
  className = "",
}: AchievementProgressProps) {
  const progress = calculateProgress(earnedBadges, totalBadges);

  return (
    <div className={className}>
      {/* Progress Text - Only above the progress bar */}
      <div className="flex justify-between w-[calc(100%-10rem)]">
        <div className="text-gray-700 font-medium">Overall Progress</div>
        <div className="text-gray-700 font-medium">{progress}%</div>
      </div>

      {/* Progress Bar and Badge - Side by side */}
      <div className="flex items-center gap-4 w-full">
        {/* Progress Bar Container */}
        <div className="flex-1 relative">
          {/* Progress Bar */}
          <div className="h-4 bg-gray-200 rounded-full w-full">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Badge Counter */}
        <AchievementCounter
          earnedBadges={earnedBadges}
          totalBadges={totalBadges}
        />
      </div>
    </div>
  );
}

function AchievementCounter({
  earnedBadges,
  totalBadges,
}: {
  earnedBadges: number;
  totalBadges: number;
}) {
  return (
    <div className="bg-white rounded-full h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 flex flex-col items-center justify-center shadow-xl border-4 border-white">
      <div className="flex items-baseline px-1">
        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-500">
          {earnedBadges}
        </span>
        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-300">
          /
        </span>
        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-300">
          {totalBadges}
        </span>
      </div>
      <div className="text-[10px] sm:text-xs md:text-base font-medium text-gray-600 mt-0.5 text-center px-1">
        Badges Earned
      </div>
    </div>
  );
}
