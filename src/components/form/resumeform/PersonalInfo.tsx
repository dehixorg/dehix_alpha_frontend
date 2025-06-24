import React from 'react';
import { PlusCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="space-y-1.5 ml-5 mb-5">
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
                <Label htmlFor={`firstName-${index}`}>First Name</Label>
                <Input
                  id={`firstName-${index}`}
                  value={info.firstName}
                  onChange={(e) =>
                    handleInputChange(index, 'firstName', e.target.value)
                  }
                  placeholder="Enter your first name"
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                <Input
                  id={`lastName-${index}`}
                  value={info.lastName}
                  onChange={(e) =>
                    handleInputChange(index, 'lastName', e.target.value)
                  }
                  placeholder="Enter your last name"
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`city-${index}`}>City</Label>
                <Input
                  id={`city-${index}`}
                  value={info.city}
                  onChange={(e) =>
                    handleInputChange(index, 'city', e.target.value)
                  }
                  placeholder="Enter your city"
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <Label htmlFor={`country-${index}`}>Country</Label>
                <Input
                  id={`country-${index}`}
                  value={info.country}
                  onChange={(e) =>
                    handleInputChange(index, 'country', e.target.value)
                  }
                  placeholder="Enter your country"
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor={`phoneNumber-${index}`}>Phone</Label>
              <Input
                id={`phoneNumber-${index}`}
                value={info.phoneNumber}
                onChange={(e) =>
                  handleInputChange(index, 'phoneNumber', e.target.value)
                }
                placeholder="Enter your phone number"
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <Label htmlFor={`email-${index}`}>Email</Label>
              <Input
                id={`email-${index}`}
                value={info.email}
                onChange={(e) =>
                  handleInputChange(index, 'email', e.target.value)
                }
                placeholder="Enter your email address"
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <Label htmlFor={`github-${index}`}>Github Id</Label>
              <Input
                id={`github-${index}`}
                value={info.github}
                onChange={(e) =>
                  handleInputChange(index, 'github', e.target.value)
                }
                placeholder="Enter your github id"
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <Label htmlFor={`linkedin-${index}`}>LinkedIn Id</Label>
              <Input
                id={`linkedin-${index}`}
                value={info.linkedin}
                onChange={(e) =>
                  handleInputChange(index, 'linkedin', e.target.value)
                }
                placeholder="Enter your linkedin id"
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        ))}
      </form>
      <div className="flex justify-center mt-4">
        <Button 
          onClick={handleAddPersonalInfo}
          className="text-center  dark:text-black  light:bg-black px-72"
        >
          <PlusCircle />
        </Button>
      </div>
    </div>
  );
};
