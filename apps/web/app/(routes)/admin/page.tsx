import { prefetchSupabaseQuery } from "@packages/lib/supabase-server";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAdminStats } from "~/lib/queries/admin/get-admin-stats";
import { AdminOverviewSkeleton } from "~/components/sections/admin/skeletons";

const AdminOverview = dynamic(
  () =>
    import("~/components/sections/admin/admin-overview").then((mod) => ({
      default: mod.AdminOverview,
    })),
  {
    loading: () => <AdminOverviewSkeleton />,
  },
);

export default async function AdminDashboardPage() {
  const queryClient = new QueryClient();

  await prefetchSupabaseQuery(
    queryClient,
    "admin-stats",
    (client) => getAdminStats(client),
    [],
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<AdminOverviewSkeleton />}>
        <AdminOverview />
      </Suspense>
    </HydrationBoundary>
  );
}
