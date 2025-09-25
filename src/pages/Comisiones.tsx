import React from "react";
import { mockCommissions } from "@/data/commissions";
import { CommissionsKPICards } from "@/components/CommissionsKPICards";
import { CommissionsCharts } from "@/components/CommissionsCharts";
import { CommissionsTable } from "@/components/CommissionsTable";

export default function Comisiones() {
  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-0">
            <h1 className="text-3xl font-bold mb-1 tracking-tight text-[#00c73d]">
              Comisiones
            </h1>
          </div>

          {/* KPI Cards */}
          <CommissionsKPICards commissions={mockCommissions} />

          {/* Charts */}
          <CommissionsCharts commissions={mockCommissions} />

          {/* Table */}
          <CommissionsTable commissions={mockCommissions} />
        </div>
      </div>
    </div>
  );
}