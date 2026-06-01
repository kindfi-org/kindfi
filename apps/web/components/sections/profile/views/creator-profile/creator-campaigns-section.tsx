"use client";

import { AnimatePresence } from "framer-motion";
import { Plus, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/base/button";
import { useI18n } from "~/lib/i18n";
import { ProfileStatCard } from "../../profile-stat-card";
import { ProfileSurfaceCard } from "../../profile-surface-card";
import { ProjectCard } from "./project-card";
import type { CreatorProjectWithBalance } from "./types";

interface CreatorCampaignsSectionProps {
  projectsCount: number;
  activeProjectsCount: number;
  totalRaised: number;
  formatCurrency: (amount: number) => string;
  projectsWithBalances: CreatorProjectWithBalance[];
  isLoading: boolean;
  error: unknown;
}

export function CreatorCampaignsSection({
  projectsCount,
  activeProjectsCount,
  totalRaised,
  formatCurrency,
  projectsWithBalances,
  isLoading,
  error,
}: CreatorCampaignsSectionProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <ProfileStatCard
          label={t("profile.totalCampaigns")}
          value={String(projectsCount)}
        />
        <ProfileStatCard
          label={t("profile.activeCampaigns")}
          value={String(activeProjectsCount)}
        />
        <ProfileStatCard
          label={t("profile.totalRaised")}
          value={formatCurrency(totalRaised)}
        />
      </div>

      <div className="flex gap-3">
        <Button asChild className="gradient-btn rounded-full text-white">
          <Link href="/create-project">
            <Plus className="h-4 w-4 mr-2" />
            {t("profile.createCampaign")}
          </Link>
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground">
            {t("profile.loadingCampaigns")}
          </p>
        ) : error ? (
          <ProfileSurfaceCard>
            <p className="py-8 text-center text-destructive">
              {t("profile.campaignsError")}
            </p>
          </ProfileSurfaceCard>
        ) : projectsWithBalances.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectsWithBalances.map((project) => (
              <ProjectCard key={project.id} project={project} t={t} />
            ))}
          </div>
        ) : (
          <ProfileSurfaceCard className="py-12 text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-emerald-600/70" />
            <h3 className="mb-2 text-lg font-semibold">
              {t("profile.noCampaignsTitle")}
            </h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
              {t("profile.noCampaignsDescription")}
            </p>
            <Button asChild className="gradient-btn rounded-full text-white">
              <Link href="/create-project">
                <Plus className="h-4 w-4 mr-2" />
                {t("profile.createFirstCampaign")}
              </Link>
            </Button>
          </ProfileSurfaceCard>
        )}
      </AnimatePresence>
    </div>
  );
}
