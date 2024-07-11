'use client';
import * as React from 'react';

interface MobileSkillDomProps {
  heading: string;
  checkboxLabels: string[];
}

const MobileSkillDom: React.FC<MobileSkillDomProps> = ({
  heading,
  checkboxLabels,
}) => {
  const [checkboxStates, setCheckboxStates] = React.useState<boolean[]>(
    new Array(checkboxLabels.length).fill(false),
  );
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const handleCheckboxChange = (index: number) => {
    setCheckboxStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index]; // Toggle the checkbox state
      return newStates;
    });
  };

  const filteredSkills = checkboxLabels.filter((label) =>
    label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const visibleSkills = filteredSkills.slice(0, 3);
  const hiddenSkills = filteredSkills.slice(3);

  return (
    <div>
      <h1 className="mt-2 text-black">{heading}</h1>
      <div className="items-center p-2">
        <input
          type="text"
          placeholder="Search skills"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-2 px-2 py-1 border rounded-sm bg-gray-200"
        />
        {visibleSkills.map((label, index) => (
          <div key={index} className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={checkboxStates[index]}
              onChange={() => handleCheckboxChange(index)}
              className="mr-2"
            />
            <label className="text-sm text-black">{label}</label>
          </div>
        ))}
        {filteredSkills.length > 3 && (
          <div className="flex items-center mb-1">
            <button
              className="text-sm text-blue-500 cursor-pointer"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'Less Options' : 'More Options'}
            </button>
          </div>
        )}
        {showMore &&
          hiddenSkills.map((label, index) => (
            <div key={index} className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={checkboxStates[visibleSkills.length + index]}
                onChange={() =>
                  handleCheckboxChange(visibleSkills.length + index)
                }
                className="mr-2"
              />
              <label className="text-sm text-black">{label}</label>
            </div>
          ))}
        {filteredSkills.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No skills found.</p>
        )}
      </div>
    </div>
  );
};

export default MobileSkillDom;
