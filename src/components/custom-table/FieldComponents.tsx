'use client';

import Link from 'next/link';
import { memo } from 'react';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { Currency, FieldComponentProps, FieldType } from './FieldTypes';

import { cn } from '@/lib/utils';

const TextField = memo(({ value }: FieldComponentProps<string>) => (
  <span>{value || '-'}</span>
));
TextField.displayName = 'TextField';

const ActionField = ({
  id,
  fieldData,
  refetch,
  value,
}: FieldComponentProps<any>) => {
  // Show status message if no actions available
  if (!fieldData.actions?.options?.length) {
    const status = value?.bid_status || value?.status;

    if (status === 'ACCEPTED') {
      return (
        <span className="text-sm font-medium text-green-600">
          Bid has been accepted
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="text-sm font-medium text-red-600">
          Bid has been rejected
        </span>
      );
    }

    return (
      <span className="text-sm font-medium text-gray-500">
        No actions available
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm text-white hover:bg-gray-700 p-1 rounded transition-colors">
        {fieldData.actions?.icon || <DotsHorizontalIcon />}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black border-gray-600">
        {fieldData.actions?.options.map(
          ({ actionName, type, handler, href, className }, index) => (
            <DropdownMenuItem key={index} className="px-0 py-0">
              {type === 'Button' ? (
                <button
                  onClick={() => handler?.({ id, refetch })}
                  className={cn(
                    'w-full py-2 px-3 text-left text-sm font-medium text-white hover:bg-gray-800',
                    className,
                  )}
                >
                  {actionName}
                </button>
              ) : (
                <Link
                  href={href || '#'}
                  className={cn(
                    'block w-full py-2 px-3 text-sm font-medium text-white hover:bg-gray-800',
                    className,
                  )}
                >
                  {actionName}
                </Link>
              )}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CurrencyField = memo(
  ({ fieldData, value }: FieldComponentProps<string>) => {
    const currency = fieldData.currency || Currency.USD;
    const amount = Number(value) || 0;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

    return <span className="font-medium text-green-600">{formatted}</span>;
  },
);
CurrencyField.displayName = 'CurrencyField';

const StatusField = memo(
  ({ value, fieldData }: FieldComponentProps<string>) => {
    if (!value) return <span className="text-gray-400">-</span>;

    const statusConfig = fieldData.statusFormats?.find(
      (status) => status.value.toLowerCase() === value.toLowerCase(),
    );

    if (!statusConfig) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-sm text-xs font-medium">
          {value}
        </span>
      );
    }

    return (
      <span
        style={{
          backgroundColor: statusConfig.bgColor,
          color: statusConfig.textColor,
        }}
        className={`px-2 py-1 rounded-sm text-xs font-medium text-center ${
          statusConfig.isUppercase ? 'uppercase' : ''
        }`}
      >
        {statusConfig.textValue}
      </span>
    );
  },
);
StatusField.displayName = 'StatusField';

const CustomComponent = ({
  fieldData,
  id,
  value,
  refetch,
}: FieldComponentProps<any>) => {
  if (!fieldData.CustomComponent)
    return <span className="text-gray-400">-</span>;
  return <fieldData.CustomComponent id={id} data={value} refetch={refetch} />;
};

const COMPONENT_MAP = {
  [FieldType.ACTION]: ActionField,
  [FieldType.CURRENCY]: CurrencyField,
  [FieldType.STATUS]: StatusField,
  [FieldType.CUSTOM]: CustomComponent,
  [FieldType.TEXT]: TextField,
} as const;

export const CustomTableCell = ({
  value,
  fieldData,
  id,
  refetch,
}: FieldComponentProps<any>) => {
  const Component = COMPONENT_MAP[fieldData.type] || TextField;
  return (
    <Component fieldData={fieldData} value={value} id={id} refetch={refetch} />
  );
};
