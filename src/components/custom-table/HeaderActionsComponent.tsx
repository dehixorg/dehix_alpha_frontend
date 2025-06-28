import { twMerge } from "tailwind-merge";
import { CustomTableChildComponentsProps, HeaderActions } from "./FieldTypes";
import React from "react";

interface HeaderActionComponentProps extends CustomTableChildComponentsProps {
  headerActions?: Array<HeaderActions | React.FC<CustomTableChildComponentsProps>>;
}

export const HeaderActionComponent = ({
  headerActions,
  refetch
}: HeaderActionComponentProps) => {
  return (
    <div className="flex gap-3 mr-4 flex-wrap flex-grow flex-row-reverse">
      {headerActions?.map((Actions, index) => (
        typeof Actions === 'function' ? <Actions refetch={refetch} key={index} /> :
        <div
          key={index}
          className={twMerge(
            "px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-sm flex items-center gap-2 sm:px-2 cursor-pointer sm:py-1 md:px-3 md:py-3 lg:px-3 lg:py-3 xl:px-3 xl:py-2 hover:bg-gray-300",
            (typeof Actions === 'object' && 'className' in Actions! ? Actions.className : '')
          )}
          onClick={() => typeof Actions === 'object' && 'handler' in Actions! ? Actions.handler : ''}
        >
          {typeof Actions === 'object' && 'icon' in Actions! ? Actions.icon : ''}
          {typeof Actions === 'object' && 'name' in Actions! ? Actions.name : ''}
        </div>
      ))}
    </div>
  );
};
