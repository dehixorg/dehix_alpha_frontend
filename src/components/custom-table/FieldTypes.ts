import React from "react";

export enum FilterDataType {
  SINGLE = "Single",
  MULTI = "Multi",
  CALENDER = "Calendar",
}

export enum FieldType {
  TEXT = "Text",
  LINK = "Link",
  CURRENCY = "Currency",
  CRYPTO = "Crypto",
  DATE = "Date",
  DATETIME = "DateTime",
  ACTION = "Action",
  ARRAY_VALUE = "ArrayValue",
  STATUS = "Status",
  TOGGLE = "Toggle",
  TOOLTIP = "Tooltip",
  LONGTEXT = "LongText",
  CUSTOM = "Custom",
  LENGTH = "Length",
}

interface ActionHandler extends CustomTableChildComponentsProps {
  id: string;
}

export interface Actions {
  icon?: React.ReactNode;
  options: Array<{
    actionName: string;
    actionIcon: React.JSX.Element;
    type: "Button" | "Link";
    href?: string;
    handler?: ({ id, refetch }: ActionHandler) => void;
    className?: string;
  }>;
}

export enum Currency {
  INR = "INR",
  USD = "USD",
}

export interface CustomComponentProps extends CustomTableChildComponentsProps {
  id: string;
  data: Record<string, any>;
}

export interface Field {
  fieldName?: string; // name of the key for the field in the api response
  textValue: string; // text to be displayed in the table header
  type: FieldType; // type of the field
  width?: number;
  formating?: object;
  link?: string; // the placeholder link to be displayed if type === FieldType.LINK
  tooltip?: boolean;
  tooltipContent?: string; // tooltip content to be displayed if tooltip === true
  className?: string; // custom tailwind classes to be added to the table cell
  arrayName?: string; // the key in the api response if type === FieldType.ARRAY_VALUE and the value is an array of objects than  array of strings
  onToggle?: (value: boolean, id: string) => void;
  actions?: Actions; // if type === FieldType.ACTIONS then this parameter will contain your actions metadata
  currency?: Currency; // if type === FieldType.CURRENCY then this parameter will be the currency type, default is INR
  statusFormats?: Array<{
    bgColor?: string; // HEX or RGB or pre defined css colors
    textColor?: string;
    isUppercase?: boolean;
    value: string;
    textValue: string;
  }>; // if type === FieldType.STATUS then this parameter will the formating options like color and all for the different statuses
  wordsCnt?: number; // If type === FieldType.LongText then this parameter will decide how many words to show and if the value exceeds this, the element will become a tooltip to show remaining text
  CustomComponent?: ({
    id,
    data,
    refetch,
  }: CustomComponentProps) => React.JSX.Element;
}

export interface HeaderActions {
  name: string;
  icon: React.ReactNode;
  handler: () => void;
  className?: string;
}

export interface Params {
  title?: string;
  uniqueId: string;
  filterData?: Array<{
    type: FilterDataType;
    name: string;
    textValue: string;
    options: Array<{
      value: string;
      label: string;
    }>;
    arrayName?: string;
  }>;
  fields: Array<Field>;
  api: string;
  params?: Record<string, any>;
  searchColumn?: Array<string>;
  isFilter?: boolean;
  isDownload?: boolean;
  tableHeaderActions?: Array<
    HeaderActions | React.FC<CustomTableChildComponentsProps>
  >;
  mainTableActions?: Array<
    HeaderActions | React.FC<CustomTableChildComponentsProps>
  >;
  sortBy?: Array<{
    label: string;
    fieldName: string;
  }>;
}

export interface FieldComponentProps<T>
  extends CustomTableChildComponentsProps {
  value: T;
  fieldData: Field;
  id: string;
}

export interface FiltersArrayElem {
  fieldName: string;
  textValue: string;
  value: string;
  arrayName?: string;
}

export interface CustomTableChildComponentsProps {
  refetch?: () => void;
}
