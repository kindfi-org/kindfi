import { prefetchSupabaseQuery } from "@packages/lib/supabase-server";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { AdminGamificationSkeleton } from "~/components/sections/admin/skeletons";

const AdminGamificationManager = dynamic(
  () =>
    import("~/components/sections/admin/admin-gamification-manager").then(
      (mod) => ({ default: mod.AdminGamificationManager }),
    ),
  {
    loading: () => <AdminGamificationSkeleton />,
  },
);

export default async function AdminGamificationPage() {
  const queryClient = new QueryClient();

  await prefetchSupabaseQuery(
    queryClient,
    "quests",
    async (supabase) => {
      const { data, error } = await supabase
        .from("quest_definitions")
        .select("*")
        .order("quest_id", { ascending: true });

      if (error) throw error;
      return { quests: data || [] };
    },
    [],
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<AdminGamificationSkeleton />}>
        <AdminGamificationManager />
      </Suspense>
    </HydrationBoundary>
  );
}
