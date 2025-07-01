// src/config/defaultReportInfo.ts

export type ReportInfo = {
  report_role: string;
  report_type: string;
  reportedbyId: string;
};

export const defaultReportInfo: ReportInfo = {
  report_role: "STUDENT",
  report_type: "GENERAL",
  reportedbyId: "user123",
};
