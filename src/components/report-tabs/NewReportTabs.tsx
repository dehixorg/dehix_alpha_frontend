import { ReportForm } from '@/components/form/ReportForm';

interface NewReportTabProps {
  reportData: any;
}

export const NewReportTab = ({ reportData }: NewReportTabProps) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden  rounded-md p-2">
      <h2 className="text-lg font-semibold mb-2">Create New Report</h2>
      <div className="flex-1 overflow-y-auto">
        <ReportForm initialData={reportData} />
      </div>
    </div>
  );
};
