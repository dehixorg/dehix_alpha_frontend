'use client';

import { DownloadIcon, PackageOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { ToolTip } from '../ToolTip';
import { useToast } from '../ui/use-toast';

import { FieldType, FiltersArrayElem, Params } from './FieldTypes';
import { CustomTableCell } from './FieldComponents';
import FilterTable from './FilterTable';
import { HeaderActionComponent } from './HeaderActionsComponent';
import { TablePagination } from './Pagination';
import { TableSelect } from './TableSelect';

import { apiHelperService } from '@/services/custumTable';
import { Messages } from '@/utils/common/enum';
import { cn } from '@/lib/utils';

export const CustomTable = ({
  title,
  fields,
  filterData,
  api,
  data: externalData,
  uniqueId,
  tableHeaderActions,
  mainTableActions,
  searchColumn,
  sortBy,
  isFilter = true,
  isDownload = false,
}: Params) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<FiltersArrayElem[]>(
    [],
  );
  // const [sortByState, setSortByState] = useState<Array<{label: string, fieldName: string}>>(sortBy || [])
  const [sortByValue, setSortByValue] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<1 | -1>(1);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      window.scrollTo(0, 0);

      // If external data is provided, use it instead of fetching from API
      if (externalData) {
        let filteredData = [...externalData];

        // Apply search filter if search term exists
        if (search && searchColumn && searchColumn.length > 0) {
          filteredData = filteredData.filter((item) =>
            searchColumn.some((column) =>
              String(item[column] || '')
                .toLowerCase()
                .includes(search.toLowerCase()),
            ),
          );
        }

        // Apply custom filters
        selectedFilters.forEach((filter) => {
          filteredData = filteredData.filter((item) => {
            const fieldValue = filter.arrayName
              ? item[filter.fieldName]?.[filter.arrayName]
              : item[filter.fieldName];
            return String(fieldValue || '')
              .toLowerCase()
              .includes(filter.value.toLowerCase());
          });
        });

        setData(filteredData);
        setLoading(false);
        return;
      }

      // Only fetch from API if api prop is provided
      if (!api) {
        setLoading(false);
        return;
      }

      const params: Record<string, any> = {
        filters: '',
        page: page,
        limit: limit,
      };
      selectedFilters.map((filter) => {
        params['filters'] += [`filter[${filter.fieldName}],`];
      });
      selectedFilters.map((filter) => {
        if (filter.arrayName) {
          params[`filter[${filter.fieldName}.${filter.arrayName}]`] =
            filter.value;
        } else {
          params[`filter[${filter.fieldName}]`] = filter.value;
        }
      });
      if (search != '') {
        params['filter[search][value]'] = search;
        params['filter[search][columns]'] = searchColumn?.join(',');
      }

      params['filter[sortBy]'] = sortByValue;
      params['filter[sortOrder]'] = sortOrder;
      const response = await apiHelperService.fetchData(api, params);
      setData(response.data.data);
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: Messages.FETCH_ERROR(title || ''),
        variant: 'destructive', // Red error message
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setPage(1);
  }, [selectedFilters, search, limit]);

  const setFiltersUtils = (filters: FiltersArrayElem[]) => {
    setSelectedFilters(filters);
  };

  const setPageUtils = (page: number) => {
    setPage(page);
  };

  const setLimitUtils = (limit: number) => {
    setLimit(limit);
  };

  const handleDownload = () => {
    let content = '';

    const headings: string[] = [];
    fields.forEach((field) => {
      if (field.type !== FieldType.ACTION) headings.push(field.textValue);
    });
    content += headings.join(',') + '\n';

    data.forEach((elem) => {
      const fieldValues: string[] = [];
      fields.forEach((field) => {
        if (field.fieldName && field.type !== FieldType.ACTION) {
          if (field.type === FieldType.ARRAY_VALUE)
            fieldValues.push(
              (elem[field.fieldName] as Record<string, any>[])
                .map((val) => val[field.arrayName!])
                .join('|'),
            );
          else fieldValues.push(elem[field.fieldName]);
        }
      });
      content += fieldValues.join(',') + '\n';
    });

    const blob = new Blob([content], { type: 'text/csv' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'data.csv';

    a.click();
  };

  const refetch = () => {
    fetchData();
  };

  return (
    <div className="px-4">
      <div className="w-full flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300 tracking-wider">
          {title}
        </h1>
        <HeaderActionComponent
          headerActions={mainTableActions}
          refetch={refetch}
        />
        <TableSelect
          currValue={limit}
          label="Items Per Page"
          values={[10, 15, 20, 25]}
          setCurrValue={setLimitUtils}
        />
        {/* Download Button */}
        {isDownload && (
          <span
            className="w-fit text-sm text-gray-600 mx-4 bg-gray-100 border-gray-400 cursor-pointer hover:bg-gray-200 transition-colors shadow-sm py-2.5 px-3 rounded-sm"
            onClick={handleDownload}
          >
            <DownloadIcon className="inline mr-1 size-4 dark:text-gray-900" />
            Download
          </span>
        )}
      </div>
      <div className="mb-8 mt-4">
        <Card>
          {isFilter && (
            <FilterTable
              filterData={filterData}
              tableHeaderActions={tableHeaderActions}
              setFilters={setFiltersUtils}
              search={search}
              setSearch={setSearch}
              sortByArr={sortBy || []}
              setSortByValue={setSortByValue}
              setSortOrder={setSortOrder}
              isSearch={searchColumn ? searchColumn.length > 0 : false}
              refetch={refetch}
            />
          )}
          <div className="lg:overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {fields.map((field) => (
                    <TableHead
                      key={field.fieldName}
                      className={cn('text-center', field.className)}
                    >
                      {field.tooltip ? (
                        <ToolTip
                          trigger={field.textValue}
                          content={field.tooltipContent || ''}
                        />
                      ) : (
                        field.textValue
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    {[...Array(10)].map((_, i) => (
                      <TableRow key={i}>
                        {fields.map((field) => (
                          <TableCell key={field.fieldName}>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                ) : data?.length > 0 ? (
                  data.map((elem: any) => (
                    <TableRow key={elem._id}>
                      {fields.map((field, index) => (
                        <TableCell
                          key={field.fieldName || index}
                          className={cn(
                            'text-gray-900 dark:text-gray-100 text-center [&>*]:text-gray-900 [&>*]:dark:text-gray-100',
                            field.className,
                          )}
                          width={field.width}
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
                            key={index}
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
                        <PackageOpen
                          className="text-muted-foreground"
                          size={48}
                        />
                        <p className="text-muted-foreground text-sm">
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
        <TablePagination
          page={page}
          setPage={setPageUtils}
          isNextAvailable={data?.length >= limit}
        />
      </div>
    </div>
  );
};
