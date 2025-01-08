import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, PlusCircle, X } from 'lucide-react';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  phoneNumber: string;
  email: string;
  github: string;
  linkedin: string;
}

interface PersonalInfoProps {
  personalData: PersonalInfo[];
  setPersonalData: React.Dispatch<React.SetStateAction<PersonalInfo[]>>;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  personalData,
  setPersonalData,
}) => {
  const handleInputChange = (
    index: number,
    field: keyof PersonalInfo,
    value: string,
  ) => {
    const updatedPersonalData = [...personalData];
    updatedPersonalData[index] = {
      ...updatedPersonalData[index],
      [field]: value,
    };
    setPersonalData(updatedPersonalData);
  };

  const handleAddPersonalInfo = () => {
    setPersonalData([
      ...personalData,
      {
        firstName: '',
        lastName: '',
        city: '',
        country: '',
        phoneNumber: '',
        email: '',
        github: '',
        linkedin: '',
      },
    ]);
  };

  const handleRemovePersonalInfo = (index: number) => {
    const updatedPersonalData = personalData.filter((_, i) => i !== index);
    setPersonalData(updatedPersonalData);
  };

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl">Personal Info</h2>
        <p className="text-sm text-gray-500">Tell us about yourself.</p>
      </div>

      <form className="space-y-5">
        {personalData.map((info, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">
                Personal Info {index + 1}
              </h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemovePersonalInfo(index)}
                  className="p-1 rounded-full"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  First Name
                </label>
                <Input
                  value={info.firstName}
                  onChange={(e) =>
                    handleInputChange(index, 'firstName', e.target.value)
                  }
                  placeholder="Enter your first name"
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <Input
                  value={info.lastName}
                  onChange={(e) =>
                    handleInputChange(index, 'lastName', e.target.value)
                  }
                  placeholder="Enter your last name"
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  City
                </label>
                <Input
                  value={info.city}
                  onChange={(e) =>
                    handleInputChange(index, 'city', e.target.value)
                  }
                  placeholder="Enter your city"
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Country
                </label>
                <Input
                  value={info.country}
                  onChange={(e) =>
                    handleInputChange(index, 'country', e.target.value)
                  }
                  placeholder="Enter your country"
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Phone
              </label>
              <Input
                value={info.phoneNumber}
                onChange={(e) =>
                  handleInputChange(index, 'phoneNumber', e.target.value)
                }
                placeholder="Enter your phone number"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Email
              </label>
              <Input
                value={info.email}
                onChange={(e) =>
                  handleInputChange(index, 'email', e.target.value)
                }
                placeholder="Enter your email address"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Github Id
              </label>
              <Input
                value={info.github}
                onChange={(e) =>
                  handleInputChange(index, 'github', e.target.value)
                }
                placeholder="Enter your github id"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Linkedin Id
              </label>
              <Input
                value={info.linkedin}
                onChange={(e) =>
                  handleInputChange(index, 'linkedin', e.target.value)
                }
                placeholder="Enter your linkedin id"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
      </form>

      <div className="flex justify-center mt-4">
        <Button
          onClick={handleAddPersonalInfo}
          className="text-center bg-gray hover:bg-gray-600 text-white"
        >
          <PlusCircle />
        </Button>
      </div>

      <div className="flex justify-center mt-4">
        <Button className="text-center bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle />
        </Button>
      </div>
    </div>
  );
};
