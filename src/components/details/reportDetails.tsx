"use client";

import { useSearchParams } from "next/navigation";
import { ReportForm } from "@/components/form/ReportForm";
import { CustomComponentProps } from "../custom-table/FieldTypes";

export const ReportDetails = ({ id, data }: CustomComponentProps) => {
  const searchParams = useSearchParams();

  const reportedId = searchParams.get("id") || "";
  const reportRole = searchParams.get("role") || "user";
  const reportType = searchParams.get("type") || "bug";

  const reportData = {
    subject: "",
    description: "",
    report_role: reportRole,
    report_type: reportType,
    status: "OPEN",
    reportedById: "",
    reportedId: reportedId,
  };

  return (
    data && (
      <div className="px-4 sm:px-6">
        <h1 className="text-2xl font-semibold mb-6">Report an Issue</h1>
        <ReportForm initialData={reportData} />
      </div>
    )
  );
};
