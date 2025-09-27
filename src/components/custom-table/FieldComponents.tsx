import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { twMerge } from 'tailwind-merge';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { ToolTip } from '../ToolTip';

import { Actions, FieldComponentProps, FieldType } from './FieldTypes';

import { formatCurrency } from '@/utils/format';

// Determine fraction digits per currency (extend as needed)
const getCurrencyFractionDigits = (currencyCode: string): number => {
  const code = (currencyCode || '').toUpperCase();
  const special: Record<string, number> = {
    JPY: 0,
    KRW: 0,
    VND: 0,
    BTC: 8,
    ETH: 6,
    USDT: 2,
  };
  return special[code] ?? 2;
};

const DateTimeField = ({ value }: FieldComponentProps<string>) => {
  const date = new Date(value);
  return <>{date.toUTCString()}</>;
};

const DateField = ({ value }: FieldComponentProps<string>) => {
  const date = new Date(value);
  return <>{date.toLocaleDateString()}</>;
};

const TextField = ({ value }: FieldComponentProps<string>) => {
  return <span>{value}</span>;
};

const LinkField = ({ value, fieldData }: FieldComponentProps<string>) => {
  return (
    <Link
      href={value}
      target="__blank"
      className="text-blue-400 hover:underline"
    >
      {fieldData.link}
    </Link>
  );
};

const ToggleField = ({
  fieldData,
  value,
  id,
}: FieldComponentProps<boolean | string>) => {
  'use client';
  const [toggleVal, setToggleVal] = useState(Boolean(value));

  return (
    <Switch
      checked={toggleVal}
      onCheckedChange={() => {
        setToggleVal(!toggleVal);
        fieldData.onToggle?.(!toggleVal, id);
      }}
    />
  );
};

const ArrayValueField = ({
  value,
  fieldData,
}: FieldComponentProps<Array<Record<string, any>>>) => {
  return (
    <div className="relative group cursor-pointer">
      {value.length > 0 ? (
        <>
          <ToolTip
            trigger={
              <div className="">
                <span>
                  {fieldData.arrayName
                    ? value[0][fieldData.arrayName]
                    : value[0]}{' '}
                </span>
                <span className="text-xs text-gray-500">
                  {value.length > 1 && `+${value.length - 1} more`}
                </span>
              </div>
            }
            content={value
              .map((val: any) =>
                fieldData.arrayName ? `${val[fieldData.arrayName!]}` : `${val}`,
              )
              .join(', ')}
          />
        </>
      ) : (
        <span className="text-xs text-gray-500">-</span>
      )}
    </div>
  );
};

const ActionField = ({
  id,
  fieldData,
  refetch,
}: FieldComponentProps<Actions>) => {
  // If no actions are available, show a status message
  if (!fieldData.actions?.options || fieldData.actions.options.length === 0) {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Final Status
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm dark:text-gray-300 text-gray-600 hover:dark:text-gray-800 hover:bg-gray-200 p-1 rounded transition duration-300">
        {fieldData.actions?.icon ? (
          fieldData.actions.icon
        ) : fieldData.actions?.options.length == 1 ? (
          <ArrowRight />
        ) : (
          <DotsVerticalIcon />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {fieldData.actions?.options.map(
          (
            { actionIcon, actionName, type, handler, href, className },
            index,
          ) => (
            <DropdownMenuItem
              key={index}
              className={`w-${fieldData.width || '32'} px-0 py-0 my-1`}
            >
              {type === 'Button' && (
                <div
                  onClick={() => handler?.({ id, refetch })}
                  className={twMerge(
                    'text-sm w-full py-2 px-3 flex items-center dark:text-gray-300 justify-start hover:cursor-pointer gap-4 font-medium text-gray-600',
                    className,
                  )}
                >
                  {actionIcon}
                  <span>{actionName}</span>
                </div>
              )}
              {type === 'Link' && (
                <Link
                  href={href || '#'}
                  className={twMerge(
                    'text-sm w-full flex py-2 px-3 items-center justify-start gap-4 font-medium text-gray-600',
                    className,
                  )}
                >
                  {actionIcon}
                  <span>{actionName}</span>
                </Link>
              )}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CurrencyField = ({ fieldData, value }: FieldComponentProps<string>) => {
  const currency = String(fieldData.currency || 'USD');
  const fractionDigits = getCurrencyFractionDigits(currency);
  const formatted = formatCurrency(
    value,
    currency,
    fractionDigits,
    fractionDigits,
  );
  return <span>{formatted}</span>;
};

const StatusField = ({ value, fieldData }: FieldComponentProps<string>) => {
  const statusMetaData = fieldData.statusFormats?.find(
    (status) => status.value.toLowerCase() === value.toLowerCase(),
  );

  if (!statusMetaData) return <span>{value}</span>;

  const { bgColor, textColor, isUppercase } = statusMetaData;
  return (
    <span
      style={{
        backgroundColor: bgColor,
        color: textColor,
        textTransform: isUppercase ? 'uppercase' : 'none',
      }}
      className=" rounded-sm px-2 py-1 text-center"
    >
      {statusMetaData.textValue}
    </span>
  );
};

export const TooltipField = ({
  value,
  fieldData,
}: FieldComponentProps<string>) => {
  return <ToolTip trigger={value} content={fieldData.tooltipContent || ''} />;
};

const LongTextField = ({ fieldData, value }: FieldComponentProps<string>) => {
  if (!value) return <span>-</span>;
  if (fieldData.wordsCnt && value.length <= fieldData.wordsCnt)
    return <span>{value}</span>;

  if (fieldData.wordsCnt)
    return (
      <ToolTip
        trigger={
          <span className=" line-clamp-1">
            {value.slice(0, fieldData.wordsCnt)}...
          </span>
        }
        content={value || ''}
      />
    );

  return (
    <ToolTip
      trigger={<span className=" line-clamp-1">{value}</span>}
      content={value || ''}
    />
  );
};

const CustomComponent = ({
  fieldData,
  id,
  value,
  refetch,
}: FieldComponentProps<any>) => {
  if (!fieldData.CustomComponent) return <div>{id}</div>;
  const Component = fieldData.CustomComponent;
  return <Component id={id} data={value} refetch={refetch} />;
};

const LengthField = ({ value }: FieldComponentProps<Record<string, any>[]>) => {
  return <span>{value.length}</span>;
};

export const mapTypeToComponent = (type: FieldType) => {
  switch (type) {
    case FieldType.DATETIME:
      return DateTimeField;
    case FieldType.DATE:
      return DateField;
    case FieldType.TEXT:
      return TextField;
    case FieldType.LINK:
      return LinkField;
    case FieldType.ARRAY_VALUE:
      return ArrayValueField;
    case FieldType.TOGGLE:
      return ToggleField;
    case FieldType.ACTION:
      return ActionField;
    case FieldType.CURRENCY:
      return CurrencyField;
    case FieldType.STATUS:
      return StatusField;
    case FieldType.CRYPTO:
      return CurrencyField;
    case FieldType.TOOLTIP:
      return TooltipField;
    case FieldType.LONGTEXT:
      return LongTextField;
    case FieldType.CUSTOM:
      return CustomComponent;
    case FieldType.LENGTH:
      return LengthField;
    default:
      return TextField;
  }
};

export const CustomTableCell = ({
  value,
  fieldData,
  id,
  refetch,
}: FieldComponentProps<any>) => {
  const FieldComponentToRender = mapTypeToComponent(fieldData.type);
  return (
    <FieldComponentToRender
      fieldData={fieldData}
      value={value}
      id={id}
      refetch={refetch}
    />
  );
};
