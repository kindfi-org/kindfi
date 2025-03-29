import { Check, Lock, Trophy } from "lucide-react";
export function NFTAchievement() {
  // Progress calculation const totalBadges = 10; const
  earnedBadges = 6;
  const progress = Math.round((earnedBadges / totalBadges) * 100);
  return (
    <div className="bg-blue-50 rounded-xl p-6 md:p-8 relative overflow-hidden">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Your Badge Collection
      </h3>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Track your progress as you earn badges by completing learning modules.
        Each badge represents mastery of a blockchain concept.
      </p>

      {/* Progress Bar and Badge Container */}
      <div className="mb-10">
        {/* Progress Text - Only above the progress bar */}
        <div className="flex justify-between  w-[calc(100%-10rem)]">
          {/* Adjusted width */}
          <div className="text-gray-700 font-medium">Overall Progress</div>
          <div className="text-gray-700 font-medium">{progress}%</div>
        </div>

        {/* Progress Bar and Badge - Side by side */}
        <div className="flex items-center gap-4 w-full">
          {/* Progress Bar Container with proper width */}
          <div className="flex-1 relative">
            {/* Progress Bar */}
            <div className="h-4 bg-gray-200 rounded-full w-full">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500
          rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Responsive Badge */}
          <div className="bg-white rounded-full h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 flex flex-col items-center justify-center shadow-xl border-4 border-white">
            <div className="flex items-baseline px-1">
              {" "}
              {/* Added px-1 for small screens */}
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
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Earned Badge Stat */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-center shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-3 rounded-full mr-5">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900">
              {earnedBadges}
            </div>
            <div className="text-gray-600 text-lg">Earned</div>
          </div>
        </div>

        {/* Locked Badge Stat */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gray-100 p-3 rounded-full mr-5">
            <Lock className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900">
              {totalBadges - earnedBadges}
            </div>
            <div className="text-gray-600 text-lg">Locked</div>
          </div>
        </div>

        {/* Total Badge Stat */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gray-100 p-3 rounded-full mr-5">
            <Trophy className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900">
              {totalBadges}
            </div>
            <div className="text-gray-600 text-lg">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
