"use client";

import { useSupabaseQuery } from "@packages/lib/hooks";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, BarChart2, Calendar, Heart, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "~/components/base/badge";
import { Button } from "~/components/base/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/base/card";
import { GamificationSection } from "~/components/sections/gamification/gamification-section";
import { useEscrow } from "~/hooks/contexts/use-escrow.context";
import { useI18n } from "~/lib/i18n";
import { getUserSupportedProjects } from "~/lib/queries/projects/get-user-projects";
import { ProfileSectionHeader } from "../profile-section-header";
import { ProfileStatCard } from "../profile-stat-card";
import { ProfileSurfaceCard } from "../profile-surface-card";

const NFTCollection = dynamic(
  () =>
    import("~/components/sections/gamification/nft-collection").then((mod) => ({
      default: mod.NFTCollection,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

interface DonorProfileProps {
  userId: string;
  displayName: string;
  showSection?: string;
}

export function DonorProfile({
  userId,
  displayName: _displayName,
  showSection = "overview",
}: DonorProfileProps) {
  const { t } = useI18n();
  const {
    data: supportedProjects = [],
    isLoading,
    error,
  } = useSupabaseQuery(
    "user-supported-projects",
    (client) => getUserSupportedProjects(client, userId),
    { additionalKeyValues: [userId] },
  );

  const { getMultipleBalances } = useEscrow();
  const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>(
    {},
  );

  // Fetch escrow balances for projects with escrow addresses
  useEffect(() => {
    const fetchBalances = async () => {
      const projectsWithEscrow = supportedProjects.filter(
        (p) => p.escrowContractAddress,
      );
      if (projectsWithEscrow.length === 0) return;

      try {
        const addresses = projectsWithEscrow.map(
          (p) => p.escrowContractAddress as string,
        );
        const balances = await getMultipleBalances(
          { addresses },
          "multi-release",
        );

        const balanceMap: Record<string, number> = {};
        addresses.forEach((address, index) => {
          const balanceResponse = balances[index];
          if (balanceResponse?.balance !== undefined) {
            balanceMap[address] = balanceResponse.balance;
          }
        });
        setEscrowBalances(balanceMap);
      } catch (error) {
        console.error("Failed to fetch escrow balances", error);
      }
    };

    if (supportedProjects.length > 0) {
      fetchBalances();
      const intervalId = setInterval(() => fetchBalances(), 10000);
      return () => clearInterval(intervalId);
    }
  }, [supportedProjects, getMultipleBalances]);

  // Projects with real-time balances
  const projectsWithBalances = useMemo(() => {
    return supportedProjects.map((project) => {
      const escrowBalance =
        project.escrowContractAddress &&
        escrowBalances[project.escrowContractAddress];
      const raised = Number(escrowBalance ?? project.raised ?? 0);
      const goal = Number(project.goal ?? 0);
      const percentageComplete =
        goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

      return { ...project, raised, percentageComplete };
    });
  }, [supportedProjects, escrowBalances]);

  // Derive stats in a single pass
  const stats = useMemo(() => {
    let totalContributed = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let totalImpact = 0;

    for (const p of projectsWithBalances) {
      totalContributed += Number(p.contributionAmount || 0);
      const isActive = p.status === "active" || p.status === "funding";
      const isCompleted = p.status === "completed" || p.status === "funded";
      if (isActive) activeProjects++;
      if (isCompleted) completedProjects++;
      if (isActive || isCompleted) {
        totalImpact += Number(p.contributionAmount || 0);
      }
    }

    const avgContribution =
      projectsWithBalances.length > 0
        ? totalContributed / projectsWithBalances.length
        : 0;

    return {
      totalContributed,
      activeProjects,
      completedProjects,
      totalImpact,
      avgContribution,
      impactScore: projectsWithBalances.length * 10,
    };
  }, [projectsWithBalances]);

  // Section rendering
  if (showSection === "gamification") {
    return <GamificationSection />;
  }

  if (showSection === "donations") {
    return (
      <ProfileSurfaceCard>
        <h3 className="mb-4 text-lg font-semibold">
          {t("profile.donationHistory")}
        </h3>
        <DonationHistory donations={projectsWithBalances} t={t} />
      </ProfileSurfaceCard>
    );
  }

  if (showSection === "nfts") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            NFT Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NFTCollection />
        </CardContent>
      </Card>
    );
  }

  // Default: overview
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
          value={String(supportedProjects.length)}
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

/* ── Subcomponents ── */

function ImpactMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function DonationHistory({
  donations,
  t,
}: {
  donations: Array<{
    id: string;
    title: string;
    contributionAmount: string | number;
    contributionDate: string | null;
  }>;
  t: (key: string) => string;
}) {
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

function SupportedProjectCard({
  project,
  t,
}: {
  project: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    image: string | null;
    raised: number;
    goal: number;
    percentageComplete: number | null;
    status: string;
    tags: Array<{ name: string; color: string | null }>;
    contributionAmount: string | number;
    contributionDate: string | null;
  };
  t: (key: string) => string;
}) {
  const percentage = project.percentageComplete ?? 0;
  const contributionAmount = Number(project.contributionAmount);

  return (
    <ProfileSurfaceCard
      padding="sm"
      className="group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md"
    >
      {project.image && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="px-5 pb-2 pt-5">
        <CardTitle className="text-base line-clamp-2">
          {project.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="space-y-2 mt-auto">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your Contribution</span>
            <span className="font-semibold">
              ${contributionAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Raised</span>
            <span className="font-semibold">
              ${Number(project.raised).toLocaleString()} / $
              {Number(project.goal).toLocaleString()}
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right tabular-nums">
            {percentage.toFixed(1)}% funded
          </p>
        </div>
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.name}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: tag.color || undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full rounded-full"
        >
          <Link href={`/projects/${project.slug}`}>
            {t("profile.viewProject")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </ProfileSurfaceCard>
  );
}
