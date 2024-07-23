import React, { useState, ChangeEvent } from 'react';

// Define a list of countries with their dialing codes and valid phone number lengths
const countries = [
  {
    code: 'AF',
    name: 'Afghanistan',
    dialCode: '+93',
    minLength: 9,
    maxLength: 10,
  },
  {
    code: 'AR',
    name: 'Argentina',
    dialCode: '+54',
    minLength: 10,
    maxLength: 10,
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'AT',
    name: 'Austria',
    dialCode: '+43',
    minLength: 10,
    maxLength: 10,
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    dialCode: '+880',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'BE', name: 'Belgium', dialCode: '+32', minLength: 9, maxLength: 9 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', minLength: 10, maxLength: 11 },
  { code: 'BN', name: 'Brunei', dialCode: '+673', minLength: 7, maxLength: 7 },
  { code: 'BT', name: 'Bhutan', dialCode: '+975', minLength: 9, maxLength: 10 },
  {
    code: 'KH',
    name: 'Cambodia',
    dialCode: '+855',
    minLength: 9,
    maxLength: 10,
  },
  { code: 'CA', name: 'Canada', dialCode: '+1', minLength: 10, maxLength: 10 },
  { code: 'CN', name: 'China', dialCode: '+86', minLength: 11, maxLength: 11 },
  { code: 'DK', name: 'Denmark', dialCode: '+45', minLength: 8, maxLength: 8 },
  { code: 'EG', name: 'Egypt', dialCode: '+20', minLength: 9, maxLength: 10 },
  {
    code: 'FI',
    name: 'Finland',
    dialCode: '+358',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'FR', name: 'France', dialCode: '+33', minLength: 9, maxLength: 9 },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    minLength: 10,
    maxLength: 11,
  },
  { code: 'GR', name: 'Greece', dialCode: '+30', minLength: 10, maxLength: 10 },
  { code: 'GH', name: 'Ghana', dialCode: '+233', minLength: 9, maxLength: 10 },
  { code: 'IN', name: 'India', dialCode: '+91', minLength: 10, maxLength: 10 },
  {
    code: 'ID',
    name: 'Indonesia',
    dialCode: '+62',
    minLength: 10,
    maxLength: 12,
  },
  { code: 'IR', name: 'Iran', dialCode: '+98', minLength: 10, maxLength: 10 },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', minLength: 9, maxLength: 10 },
  { code: 'IE', name: 'Ireland', dialCode: '+353', minLength: 9, maxLength: 9 },
  { code: 'IL', name: 'Israel', dialCode: '+972', minLength: 9, maxLength: 10 },
  { code: 'IT', name: 'Italy', dialCode: '+39', minLength: 9, maxLength: 10 },
  { code: 'JP', name: 'Japan', dialCode: '+81', minLength: 10, maxLength: 10 },
  { code: 'KE', name: 'Kenya', dialCode: '+254', minLength: 9, maxLength: 10 },
  {
    code: 'KR',
    name: 'South Korea',
    dialCode: '+82',
    minLength: 10,
    maxLength: 11,
  },
  { code: 'LA', name: 'Laos', dialCode: '+856', minLength: 9, maxLength: 10 },
  {
    code: 'MY',
    name: 'Malaysia',
    dialCode: '+60',
    minLength: 9,
    maxLength: 10,
  },
  {
    code: 'MV',
    name: 'Maldives',
    dialCode: '+960',
    minLength: 7,
    maxLength: 7,
  },
  { code: 'MX', name: 'Mexico', dialCode: '+52', minLength: 10, maxLength: 10 },
  {
    code: 'MN',
    name: 'Mongolia',
    dialCode: '+976',
    minLength: 9,
    maxLength: 10,
  },
  { code: 'MM', name: 'Myanmar', dialCode: '+95', minLength: 9, maxLength: 10 },
  { code: 'NP', name: 'Nepal', dialCode: '+977', minLength: 10, maxLength: 10 },
  {
    code: 'NL',
    name: 'Netherlands',
    dialCode: '+31',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    dialCode: '+64',
    minLength: 9,
    maxLength: 10,
  },
  {
    code: 'NG',
    name: 'Nigeria',
    dialCode: '+234',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'NO', name: 'Norway', dialCode: '+47', minLength: 8, maxLength: 8 },
  {
    code: 'PK',
    name: 'Pakistan',
    dialCode: '+92',
    minLength: 10,
    maxLength: 11,
  },
  {
    code: 'PH',
    name: 'Philippines',
    dialCode: '+63',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'PL', name: 'Poland', dialCode: '+48', minLength: 9, maxLength: 9 },
  {
    code: 'PT',
    name: 'Portugal',
    dialCode: '+351',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'RU', name: 'Russia', dialCode: '+7', minLength: 10, maxLength: 10 },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    minLength: 8,
    maxLength: 8,
  },
  {
    code: 'ZA',
    name: 'South Africa',
    dialCode: '+27',
    minLength: 9,
    maxLength: 9,
  },
  { code: 'ES', name: 'Spain', dialCode: '+34', minLength: 9, maxLength: 9 },
  { code: 'SE', name: 'Sweden', dialCode: '+46', minLength: 9, maxLength: 9 },
  {
    code: 'CH',
    name: 'Switzerland',
    dialCode: '+41',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    dialCode: '+255',
    minLength: 9,
    maxLength: 10,
  },
  {
    code: 'TH',
    name: 'Thailand',
    dialCode: '+66',
    minLength: 9,
    maxLength: 10,
  },
  { code: 'TR', name: 'Turkey', dialCode: '+90', minLength: 10, maxLength: 11 },
  { code: 'UG', name: 'Uganda', dialCode: '+256', minLength: 9, maxLength: 10 },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', minLength: 9, maxLength: 9 },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    minLength: 9,
    maxLength: 9,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    minLength: 10,
    maxLength: 11,
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    minLength: 10,
    maxLength: 10,
  },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', minLength: 9, maxLength: 10 },
];

interface PhoneNumberFormProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
}

const PhoneNumberForm: React.FC<PhoneNumberFormProps> = ({
  phoneNumber,
  onPhoneNumberChange,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('IN');
  const [isValid, setIsValid] = useState<boolean>(true);

  // Find the current country details based on selectedCountry
  const country =
    countries.find((c) => c.code === selectedCountry) || countries[0];

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(event.target.value);
    onPhoneNumberChange(''); // Reset phone number when country changes
    setIsValid(true); // Reset validity
  };

  const handlePhoneNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const completePhoneNumber = `${country.dialCode}${value}`;
    onPhoneNumberChange(completePhoneNumber);

    // Validate phone number based on selected country's format
    const valid =
      value.length >= country.minLength && value.length <= country.maxLength;
    setIsValid(valid);
  };

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center border  rounded-md w-full">
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.dialCode})
              </option>
            ))}
          </select>
          <span className="flex items-center p-1.5 mr-1 bg-transparent">
            {country.dialCode}
          </span>
        </div>
        <input
          type="tel"
          value={phoneNumber.replace(country.dialCode, '')}
          onChange={handlePhoneNumberChange}
          placeholder="Enter your phone number"
          className="flex-1 border-l bg-transparent p-1.5"
        />
      </div>
      {!isValid && phoneNumber && (
        <p className="text-red-500 text-sm mt-2">Phone number is invalid.</p>
      )}
    </div>
  );
};

export default PhoneNumberForm;
