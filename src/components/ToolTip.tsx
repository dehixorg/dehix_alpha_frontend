import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Params = {
  trigger: React.JSX.Element | string;
  content: React.JSX.Element | string;
};

export function ToolTip({ trigger, content }: Params) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* <Button variant="outline">Hover</Button> */}
          <span className="cursor-pointer">{trigger}</span>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-100 text-xs text-gray-600">
          {/* <p>Add to library</p> */}
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
