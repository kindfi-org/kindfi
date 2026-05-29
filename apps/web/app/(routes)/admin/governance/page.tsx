"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { AdminGovernanceSkeleton } from "~/components/sections/admin/skeletons";

const AdminGovernanceManager = dynamic(
  () =>
    import("~/components/sections/admin/admin-governance-manager").then(
      (mod) => ({ default: mod.AdminGovernanceManager }),
    ),
  {
    loading: () => <AdminGovernanceSkeleton />,
    ssr: false,
  },
);

export default function AdminGovernancePage() {
  return (
    <Suspense fallback={<AdminGovernanceSkeleton />}>
      <AdminGovernanceManager />
    </Suspense>
  );
}
