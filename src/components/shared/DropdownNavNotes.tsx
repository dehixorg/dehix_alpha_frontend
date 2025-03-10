import React from 'react';

import Dropdown from './Dropdown';

interface NavItem {
  label: string;
  icon: any;
  onClick: () => void;
}

interface DropdownNavNotesProps {
  navItems: NavItem[];
}

const DropdownNavNotes: React.FC<DropdownNavNotesProps> = ({ navItems }) => {
  return (
    <div className="relative overflow-visible">
      <Dropdown items={navItems} />
    </div>
  );
};

export default DropdownNavNotes;
