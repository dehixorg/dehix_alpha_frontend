import { ProfileSidebar } from "@/components/ProfileSidebar";
import { User } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex flex-col md:flex-row">
      <ProfileSidebar />
      <div className="bg-gray-800 sm:min-h-screen w-full flex justify-center items-center py-6 md:py-0">
        <div className="bg-black w-full md:w-11/12 mt-6 rounded-lg flex flex-col items-center justify-center p-4 md:p-8" style={{ height: '84%' }}>
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full overflow-hidden w-24 h-24 md:w-32 md:h-32 mb-4 bg-gray-700 flex items-center justify-center">
              <User className="w-16 h-16 md:w-20 md:h-20 text-white cursor-pointer" />
            </div>
            <h1 className="text-white text-xl md:text-2xl mb-2">John Doe</h1>
            <p className="text-gray-400 text-sm md:text-base mb-1">john.doe@example.com</p>
            <p className="text-gray-400 text-sm md:text-base">+123 456 7890</p>
          </div>
        </div>
      </div>
    </div>
  );
}
