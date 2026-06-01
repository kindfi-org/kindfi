import { formatDistanceToNow } from "date-fns";
import { Calendar, Heart } from "lucide-react";
import type { DonorDonationHistoryItem } from "./types";

interface DonationHistoryProps {
  donations: DonorDonationHistoryItem[];
  t: (key: string) => string;
}

export function DonationHistory({ donations, t }: DonationHistoryProps) {
  if (donations.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>{t("profile.noDonations")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {donations.map((donation) => {
        const amount = Number(donation.contributionAmount);
        const date = donation.contributionDate
          ? new Date(donation.contributionDate)
          : null;
        const timeAgo = date
          ? formatDistanceToNow(date, { addSuffix: true })
          : "Recently";

        return (
          <div
            key={donation.id}
            className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <Heart className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  Donated to {donation.title}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {timeAgo}
                </p>
              </div>
            </div>
            <span className="font-bold text-foreground ml-4 flex-shrink-0 tabular-nums">
              $
              {amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
