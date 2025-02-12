"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { createClient } from "../../lib/supabase/client";
import type { Database } from "../../../../services/supabase/database.types";
import { appConfig } from "../../lib/config/appConfig";

type Tables = Database["public"]["Tables"];
type EscrowRecord = Tables["escrow_status"]["Row"];
type EscrowStatusType =
  | "NEW"
  | "FUNDED"
  | "ACTIVE"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";

export const FeatureNotAvailable = () => (
  <div className="container mx-auto p-4">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-4">Feature Not Available</h1>
      <p>This feature is only available in development mode.</p>
    </div>
  </div>
);

export function EscrowTable() {
  const [dbStatus, setDbStatus] = useState<string>("Checking...");
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<EscrowRecord[]>([]);
  const supabase = createClient();
  const isFeatureEnabled = useMemo(
    () => appConfig.features.enableEscrowFeature,
    [appConfig.features.enableEscrowFeature]
  );

  const statusColors: Record<EscrowStatusType, string> = useMemo(
    () => ({
      NEW: "bg-gray-100",
      FUNDED: "bg-blue-100",
      ACTIVE: "bg-green-100",
      COMPLETED: "bg-purple-100",
      DISPUTED: "bg-red-100",
      CANCELLED: "bg-yellow-100",
    }),
    []
  );

  const fetchRecords = useCallback(async () => {
    if (!isFeatureEnabled) return;

    try {
      const { data, error } = await supabase
        .from("escrow_status")
        .select("*")
        .order("last_updated", { ascending: false });

      if (error) {
        setError(error.message);
        setDbStatus("Failed");
      } else {
        setRecords(data || []);
        setDbStatus("Connected");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setDbStatus("Failed");
    }
  }, [supabase, isFeatureEnabled]);

  const updateStatus = async (id: string, newStatus: EscrowStatusType) => {
    if (!isFeatureEnabled) return;

    try {
      const { error } = await supabase
        .from("escrow_status")
        .update({
          status: newStatus,
          last_updated: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      await fetchRecords();
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error:", err);
      alert(
        "Error updating status: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const insertTestData = async () => {
    if (!isFeatureEnabled) return;

    try {
      const { error } = await supabase.from("escrow_status").insert([
        {
          escrow_id: "test-" + Date.now(),
          status: "NEW" as EscrowStatusType,
          current_milestone: 1,
          total_funded: 1000,
          total_released: 0,
          metadata: {
            milestoneStatus: {
              total: 3,
              completed: 0,
            },
          },
        },
      ]);

      if (error) throw error;
      alert("Test data inserted successfully!");
      fetchRecords();
    } catch (err) {
      console.error("Error:", err);
      alert(
        "Error inserting test data: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  useEffect(() => {
    if (isFeatureEnabled) {
      fetchRecords();
    }
  }, [fetchRecords, isFeatureEnabled]);

  if (!isFeatureEnabled) {
    return <FeatureNotAvailable />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-4">Escrow Status System Test</h1>

      <div className="mb-4">
        <h2 className="text-xl mb-2">Database Status</h2>
        <p
          className={`font-medium ${
            dbStatus === "Connected"
              ? "text-green-600"
              : dbStatus === "Failed"
                ? "text-red-600"
                : "text-yellow-600"
          }`}
        >
          Status: {dbStatus}
        </p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      <div className="mb-4">
        <h2 className="text-xl mb-2">Test Actions</h2>
        <div className=" flex flex-col gap-3 lg:flex-row lg:gap-4 md:w-[40%]">
          <button
          type="button"
            onClick={insertTestData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Insert Test Data
          </button>

          <button
          type="button"
            onClick={fetchRecords}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Refresh Records
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl mb-2">Current Records ({records.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Escrow ID</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Milestone</th>
                <th className="border p-2">Funded</th>
                <th className="border p-2">Released</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className={statusColors[record.status]}>
                  <td className="border p-2 font-mono text-sm">{record.id}</td>
                  <td className="border p-2">{record.escrow_id}</td>
                  <td className="border p-2 font-medium">{record.status}</td>
                  <td className="border p-2">{record.current_milestone}</td>
                  <td className="border p-2">{record.total_funded}</td>
                  <td className="border p-2">{record.total_released}</td>
                  <td className="border p-2">
                    <select
                      className="border p-1 rounded"
                      onChange={(e) =>
                        updateStatus(
                          record.id,
                          e.target.value as EscrowStatusType
                        )
                      }
                      value={record.status}
                    >
                      <option value="NEW">NEW</option>
                      <option value="FUNDED">FUNDED</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="DISPUTED">DISPUTED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Status Legend:</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(statusColors).map(([status, color]) => (
            <div
              key={status}
              className={`${color} py-2 rounded text-[10px] text-center md:text-[20px]`}
            >
              {status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
