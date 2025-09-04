import BidedInterviews from '@/components/freelancer/scheduleInterview/BidedInterviews';

export default function BidedInterviewsPage() {
  return <div className="p-4">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
      Bidded Interview
    </h2>
    <div className="mt-4">
      <BidedInterviews />
    </div>
  </div>
}
