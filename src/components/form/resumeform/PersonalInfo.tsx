import React from 'react';
import { User, X } from 'lucide-react';

import { AddButton } from '@/components/ui/AddButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from '@/components/ui/card';

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
      <div className="mb-5">
        <div className="rounded-xl border bg-gradient p-4 sm:p-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 my-auto">
            <User className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Personal Information
            </h2>
            <p className="text-sm text-muted-foreground">
              Tell us about yourself.
            </p>
          </div>
        </div>
      </div>
      <form className="space-y-5">
        {personalData.map((info, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardDescription>
                  Basic contact and profile details.
                </CardDescription>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => handleRemovePersonalInfo(index)}
                    className="rounded-full"
                    type="button"
                    aria-label={`Remove personal info ${index + 1}${info.firstName || info.lastName ? `: ${[info.firstName, info.lastName].filter(Boolean).join(' ')}` : ''}`}
                    size="icon"
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`firstName-${index}`}>First Name</Label>
                  <Input
                    id={`firstName-${index}`}
                    value={info.firstName}
                    onChange={(e) =>
                      handleInputChange(index, 'firstName', e.target.value)
                    }
                    placeholder="Enter your first name"
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
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`city-${index}`}>City</Label>
                  <Input
                    id={`city-${index}`}
                    value={info.city}
                    onChange={(e) =>
                      handleInputChange(index, 'city', e.target.value)
                    }
                    placeholder="Enter your city"
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
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </form>
      <AddButton onClick={handleAddPersonalInfo} />
    </div>
  );
};
