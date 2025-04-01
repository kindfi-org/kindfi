"use client";

import { Check, Lock, Trophy } from "lucide-react";
import type {
  AchievementData,
  StatCardProps,
} from "~/lib/types/learn/nft-achievement.types";

export function NFTAchievementStats({
  totalBadges,
  earnedBadges,
}: AchievementData) {
  const lockedBadges = totalBadges - earnedBadges;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* Earned Badge Stat */}
      <StatCard
        icon={<Check className="h-6 w-6 text-green-600" />}
        iconBgColor="bg-green-100"
        borderColor="border-green-100"
        value={earnedBadges}
        label="Earned"
      />

      {/* Locked Badge Stat */}
      <StatCard
        icon={<Lock className="h-6 w-6 text-gray-500" />}
        iconBgColor="bg-gray-100"
        borderColor="border-gray-200"
        value={lockedBadges}
        label="Locked"
      />

      {/* Total Badge Stat */}
      <StatCard
        icon={<Trophy className="h-6 w-6 text-gray-500" />}
        iconBgColor="bg-gray-100"
        borderColor="border-gray-200"
        value={totalBadges}
        label="Total"
      />
    </div>
  );
}

function StatCard({
  icon,
  iconBgColor,
  borderColor,
  value,
  label,
}: StatCardProps) {
  return (
    <div
      className={`bg-white ${borderColor} rounded-xl p-5 flex items-center shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className={`${iconBgColor} p-3 rounded-full mr-5`}>{icon}</div>
      <div>
        <div className="text-4xl font-bold text-gray-900">{value}</div>
        <div className="text-gray-600 text-lg">{label}</div>
      </div>
    </div>
  );
}
