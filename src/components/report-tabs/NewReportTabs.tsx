import { ReportForm } from '@/components/form/ReportForm';

interface NewReportTabProps {
  reportData: any;
  onSubmitted?: () => boolean | Promise<boolean>;
}

export const NewReportTab = ({
  reportData,
  onSubmitted,
}: NewReportTabProps) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-md">
      <div className="flex-1 overflow-y-auto">
        <ReportForm initialData={reportData} onSubmitted={onSubmitted} />
      </div>
    </div>
  );
};
