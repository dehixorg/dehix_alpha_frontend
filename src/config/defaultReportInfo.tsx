export interface ReportInfo {
  report_role: string;
  report_type: string;
  reportedbyId: string;
}

export const defaultReportInfo: ReportInfo = {
  report_role: 'USER',      // or whatever default you want
  report_type: 'SPAM',      // or whatever default you want
  reportedbyId: '',           // You can fill this dynamically when opening dialog
};
