import React from "react";

interface UserItem {
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  username: string;
  github: string;
  instagram?: string;
}

interface UserFormProps {
  items: UserItem[];
}

const UserForm: React.FC<UserFormProps> = ({ items }) => {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="max-w-md w-full grid gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">{item.fullName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <div className="mt-1">{item.mobileNumber}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1">{item.emailAddress}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1">{item.username}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GitHub</label>
              <div className="mt-1">{item.github}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram (optional)</label>
              <div className="mt-1">{item.instagram || "Not provided"}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default UserForm;
