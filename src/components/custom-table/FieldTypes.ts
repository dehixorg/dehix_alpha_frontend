import React from 'react';

export enum FieldType {
  TEXT = 'Text',
  CURRENCY = 'Currency',
  ACTION = 'Action',
  STATUS = 'Status',
  CUSTOM = 'Custom',
}

interface ActionHandler extends CustomTableChildComponentsProps {
  id: string;
}

export interface Actions {
  icon?: React.ReactNode;
  options: Array<{
    actionName: string;
    type: 'Button' | 'Link';
    href?: string;
    handler?: ({ id, refetch }: ActionHandler) => void;
    className?: string;
  }>;
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
}

export interface CustomComponentProps extends CustomTableChildComponentsProps {
  id: string;
  data: Record<string, any>;
}

export interface FieldComponentProps<T> {
  value: T;
  fieldData: Field;
  id: string;
  refetch?: () => void;
}

export interface CustomTableChildComponentsProps {
  refetch?: () => void;
}

export interface Field {
  fieldName?: string; // name of the key for the field in the api response
  textValue: string; // text to be displayed in the table header
  type: FieldType; // type of the field
  className?: string; // custom tailwind classes to be added to the table cell
  actions?: Actions; // if type === FieldType.ACTION then this parameter will contain your actions metadata
  currency?: Currency; // if type === FieldType.CURRENCY then this parameter will be the currency type, default is USD
  statusFormats?: Array<{
    bgColor?: string; // HEX or RGB or pre defined css colors
    textColor?: string;
    isUppercase?: boolean;
    value: string;
    textValue: string;
  }>; // if type === FieldType.STATUS then this parameter will the formating options like color and all for the different statuses
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
  uniqueId: string;
  fields: Array<Field>;
  data?: any[]; // Allow passing data directly instead of API
  searchColumn?: Array<string>;
  searchPlaceholder?: string;
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
