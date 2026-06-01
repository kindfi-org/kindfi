"use client";

import { AnimatePresence } from "framer-motion";
import { BarChart2, Heart, Trophy } from "lucide-react";
import { useI18n } from "~/lib/i18n";
import { ProfileSectionHeader } from "../../profile-section-header";
import { ProfileStatCard } from "../../profile-stat-card";
import { ProfileSurfaceCard } from "../../profile-surface-card";
import { ImpactMetric } from "./impact-metric";
import { SupportedProjectCard } from "./supported-project-card";
import type { DonorProjectWithBalance } from "./types";

interface DonorOverviewProps {
  supportedProjectsCount: number;
  projectsWithBalances: DonorProjectWithBalance[];
  stats: {
    totalContributed: number;
    activeProjects: number;
    completedProjects: number;
    totalImpact: number;
    avgContribution: number;
    impactScore: number;
  };
  isLoading: boolean;
  error: unknown;
}

export function DonorOverview({
  supportedProjectsCount,
  projectsWithBalances,
  stats,
  isLoading,
  error,
}: DonorOverviewProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <ProfileSectionHeader
        title={t("profile.donorOverviewTitle")}
        highlight={t("profile.donorOverviewHighlight")}
        description={t("profile.donorOverviewDescription")}
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <ProfileStatCard
          label={t("profile.projectsSupported")}
          value={String(supportedProjectsCount)}
        />
        <ProfileStatCard
          label={t("profile.totalContributed")}
          value={`$${stats.totalContributed.toLocaleString()}`}
        />
        <ProfileStatCard
          label={t("profile.impactScore")}
          value={String(stats.impactScore)}
          icon={Trophy}
        />
      </div>

      <ProfileSurfaceCard>
        <h3 className="mb-5 flex items-center gap-2 text-base font-semibold">
          <BarChart2 className="h-4 w-4 text-emerald-600" />
          {t("profile.impactOverview")}
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ImpactMetric
            label={t("profile.totalContributed")}
            value={`$${stats.totalImpact.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            description={`${projectsWithBalances.length} projects`}
          />
          <ImpactMetric
            label={t("profile.activeProjectsLabel")}
            value={String(stats.activeProjects)}
            description="Currently supporting"
          />
          <ImpactMetric
            label={t("profile.completedProjectsLabel")}
            value={String(stats.completedProjects)}
            description="Successfully funded"
          />
          <ImpactMetric
            label={t("profile.avgContribution")}
            value={`$${stats.avgContribution.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            description="Per project"
          />
        </div>
      </ProfileSurfaceCard>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground">
            {t("profile.loadingProjects")}
          </p>
        ) : error ? (
          <ProfileSurfaceCard>
            <p className="py-8 text-center text-destructive">
              {t("profile.projectsError")}
            </p>
          </ProfileSurfaceCard>
        ) : projectsWithBalances.length > 0 ? (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              {t("profile.supportedProjects")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectsWithBalances.map((project) => (
                <SupportedProjectCard
                  key={project.id}
                  project={project}
                  t={t}
                />
              ))}
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
