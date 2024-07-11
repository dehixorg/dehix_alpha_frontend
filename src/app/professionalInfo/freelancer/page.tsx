'use client';

import { useState } from 'react';

import { ProfileSidebar } from '@/components/ProfileSidebar';
import { Button } from '@/components/ui/button';
import ModalWorkExpForm from '@/components/workExpForm/ModalWorkExpForm';

export default function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <div className="flex flex-col md:flex-row items-center min-h-screen">
      <ProfileSidebar />

      <div className="p-6 rounded-lg w-full h-auto flex flex-col mt-2 m-64">
        <div>
          <h2 className="text-white text-2xl font-bold mb-4">Experience</h2>
        </div>

        <div className="flex justify-center items-center mt-8">
          {isModalOpen ? (
            <>
              <div>
                <ModalWorkExpForm />
                <div className="flex flex-1 gap-3 mt-5">
                  <Button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    onClick={toggleModal}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Save
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={toggleModal}
            >
              Add Experience
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
