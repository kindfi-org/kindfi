import { EscrowEndpoint } from "~/lib/types/utils.types";

export const getEndpoint = (action: EscrowEndpoint): string => {
  const endpoints: Record<EscrowEndpoint, string> = {
    initiate: "/deployer/invoke-deployer-contract",
    fund: "/escrow/fund-escrow",
    dispute: "/escrow/change-dispute-flag",
    resolve: "/escrow/resolving-disputes",
    release: "/escrow/distribute-escrow-earnings",
    completeMilestone: "/escrow/change-milestone-status",
    approveMilestone: "/escrow/change-milestone-flag",
  };
  return endpoints[action];
};
