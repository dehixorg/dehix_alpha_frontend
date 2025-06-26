'use client';

import { PackageOpen } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useEffect, useState } from 'react';
import { FieldType, Params } from './FieldTypes';
import { CustomTableCell } from './FieldComponents';
import { cn } from '@/lib/utils';

export const CustomTable = ({ fields, data: propData, uniqueId }: Params) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    // Placeholder for refetch functionality
  };

  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(false);
    }
  }, [propData]);

  return (
    <div className="w-full">
      <div className="mb-8 mt-4">
        <Card>
          <div className="lg:overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {fields.map((field, index) => (
                    <TableHead
                      key={field.fieldName || index}
                      className="text-center"
                    >
                      {field.textValue}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <TableRow key={i}>
                      {fields.map((field, index) => (
                        <TableCell key={field.fieldName || index}>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.length > 0 ? (
                  data.map((elem: any, index: number) => (
                    <TableRow key={String(elem[uniqueId] ?? index)}>
                      {fields.map((field, fieldIndex) => (
                        <TableCell
                          key={field.fieldName || fieldIndex}
                          className={cn(
                            'text-gray-900 dark:text-gray-300 text-center',
                            field.className,
                          )}
                        >
                          <CustomTableCell
                            fieldData={field}
                            value={
                              field.fieldName
                                ? elem[field.fieldName]
                                : field.type === FieldType.CUSTOM
                                  ? elem
                                  : undefined
                            }
                            id={elem[uniqueId]}
                            refetch={refetch}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={fields.length}
                      className="text-center py-10"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <PackageOpen className="text-gray-400" size={48} />
                        <p className="text-gray-500 text-sm">
                          No data available
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};
