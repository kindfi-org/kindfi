"use client";

import { useSupabaseQuery } from "@packages/lib/hooks";
import { useEffect, useMemo, useState } from "react";
import { useEscrow } from "~/hooks/contexts/use-escrow.context";
import { getUserSupportedProjects } from "~/lib/queries/projects/get-user-projects";
import { logger } from "@/lib/logger";
import type { DonorProjectWithBalance } from "./types";

export function useDonorProfileData(userId: string) {
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
        logger.error("Failed to fetch escrow balances", error);
      }
    };

    if (supportedProjects.length > 0) {
      fetchBalances();
      const intervalId = setInterval(() => fetchBalances(), 10000);
      return () => clearInterval(intervalId);
    }
  }, [supportedProjects, getMultipleBalances]);

  const projectsWithBalances = useMemo((): DonorProjectWithBalance[] => {
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

  return {
    supportedProjects,
    projectsWithBalances,
    stats,
    isLoading,
    error,
  };
}
