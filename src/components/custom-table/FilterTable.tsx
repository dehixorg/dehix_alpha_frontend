import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';

import { SearchComponent } from '../custom-table/FilterSearch';
import {
  CustomTableChildComponentsProps,
  FilterDataType,
  FiltersArrayElem,
  HeaderActions,
} from '../custom-table/FieldTypes';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

import { HeaderActionComponent } from './HeaderActionsComponent';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Params extends CustomTableChildComponentsProps {
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
  setFilters: (filters: FiltersArrayElem[]) => void;
  tableHeaderActions?: Array<HeaderActions | React.FC>;
  isSearch: boolean;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  sortByArr: Array<{ label: string; fieldName: string }>;
  setSortByValue: (val: string) => void;
  setSortOrder: (val: 1 | -1) => void;
}

export const FilterTable = ({
  filterData,
  setFilters,
  tableHeaderActions,
  search,
  setSearch,
  sortByArr,
  setSortByValue,
  setSortOrder,
  isSearch,
  refetch,
}: Params) => {
  const initializeFiltersArray = () => {
    const filtersArray: FiltersArrayElem[] = [];
    filterData?.forEach((filter) =>
      filtersArray.push({
        fieldName: filter.name,
        textValue: filter.textValue,
        value: '',
        arrayName: filter.arrayName,
      }),
    );
    return filtersArray;
  };

  const [isOpen, setIsOpen] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<FiltersArrayElem[]>(
    () => initializeFiltersArray(),
  );
  const [sortChildState, setSortChildState] = useState<{
    value: string;
    order: 1 | -1;
  }>({ value: 'createdAt', order: 1 });

  useEffect(() => {
    return () => {
      setFilters([]);
    };
  }, []); // Empty dependency array to run only on unmount

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white text-black dark:bg-black dark:text-white rounded-lg">
      {/* Search Bar */}
      {isSearch && (
        <div className="w-1/3 mr-4">
          <SearchComponent searchValue={search} setSearchValue={setSearch} />
        </div>
      )}

      {/* Filters */}
      <div className="w-2/3 flex flex-grow items-center justify-between gap-4">
        <HeaderActionComponent
          headerActions={tableHeaderActions}
          refetch={refetch}
        />

        {/* Filter Button */}
        {filterData && filterData.length > 0 && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700">
                <Filter className="w-5 h-5 text-gray-800 dark:text-gray-200" />
              </button>
            </SheetTrigger>

            {/* Sliding Filter Panel */}
            <SheetContent
              side="right"
              className="w-80 p-4 bg-white dark:bg-gray-900 space-y-4 overflow-y-scroll"
            >
              <div>
                <SheetTitle className="text-lg font-medium mb-0 text-gray-800 dark:text-gray-200">
                  Filter
                </SheetTitle>
                <SheetDescription>Choose your filters</SheetDescription>
              </div>
              {filterData?.map((filter, index) => (
                <div
                  key={index}
                  className="w-full px-4 flex flex-col items-start justify-start gap-4"
                >
                  <span>{filter.textValue}</span>
                  {filter.type === FilterDataType.SINGLE ? (
                    <RadioGroup
                      value={
                        selectedFilters.find(
                          ({ fieldName }) => fieldName === filter.name,
                        )?.value
                      }
                      onValueChange={(value) => {
                        const newSelectedFilter = selectedFilters.map(
                          (filterVal) => {
                            if (filterVal.fieldName === filter.name) {
                              return { ...filterVal, value: value };
                            }
                            return filterVal;
                          },
                        );
                        setSelectedFilters(newSelectedFilter);
                      }}
                      defaultValue=""
                      className="flex flex-col text-gray-600 text-sm items-start justify-start gap-3"
                    >
                      {filter.options.map((opt, index) => (
                        <div
                          key={index}
                          className="flex items-center cursor-pointer space-x-2"
                        >
                          <RadioGroupItem value={opt.value} id={opt.value} />
                          <Label
                            className="font-normal cursor-pointer"
                            htmlFor={opt.value}
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {filter.options.map((opt, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={opt.value}
                            checked={selectedFilters
                              .find(
                                ({ fieldName }) => fieldName === filter.name,
                              )!
                              .value.includes(opt.value)}
                            onClick={() => {
                              const newSelectedFilters = selectedFilters.map(
                                (filterVal) => {
                                  if (filterVal.fieldName === filter.name) {
                                    const newValue = filterVal.value.includes(
                                      opt.value,
                                    )
                                      ? filterVal.value.replace(
                                          `${opt.value},`,
                                          '',
                                        )
                                      : `${filterVal.value}${opt.value},`;
                                    return { ...filterVal, value: newValue };
                                  }
                                  return filterVal;
                                },
                              );
                              setSelectedFilters(newSelectedFilters);
                            }}
                          />
                          <label
                            htmlFor={opt.value}
                            className="text-sm font-normal cursor-pointer text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {sortByArr.length > 0 && (
                <div className="w-full px-4 flex flex-col items-start justify-start gap-4">
                  <span>Sort By</span>
                  <RadioGroup
                    value={sortChildState.value}
                    onValueChange={(value) => {
                      setSortChildState({ ...sortChildState, value });
                    }}
                    defaultValue="createdAt"
                    className="flex flex-col text-gray-600 text-sm items-start justify-start gap-3"
                  >
                    {sortByArr.map((sortVal, index) => (
                      <div
                        key={index}
                        className="flex items-center cursor-pointer space-x-2"
                      >
                        <RadioGroupItem
                          value={sortVal.fieldName}
                          id={sortVal.fieldName}
                        />
                        <Label
                          className="font-normal cursor-pointer"
                          htmlFor={sortVal.fieldName}
                        >
                          {sortVal.label}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center cursor-pointer space-x-2">
                      <RadioGroupItem value={'createdAt'} id={'createdAt'} />
                      <Label
                        className="font-normal cursor-pointer"
                        htmlFor={'createdAt'}
                      >
                        {'Most Recent'}
                      </Label>
                    </div>
                  </RadioGroup>
                  <RadioGroup
                    value={sortChildState.order.toString()}
                    onValueChange={(value) => {
                      setSortChildState({
                        ...sortChildState,
                        order: value === '1' ? 1 : -1,
                      });
                    }}
                    defaultValue="createdAt"
                    className="flex flex-row text-gray-600 text-sm items-start justify-start gap-3"
                  >
                    {['1', '-1'].map((order) => (
                      <div
                        key={order}
                        className="flex items-center cursor-pointer space-x-2"
                      >
                        <RadioGroupItem value={order} id={order} />
                        <Label
                          className="font-normal cursor-pointer"
                          htmlFor={order}
                        >
                          {order == '-1' ? 'Newest First' : 'Oldest First'}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Apply Filters Button */}
              <button
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                onClick={() => {
                  setIsOpen(false);
                  setFilters(selectedFilters);
                  setSortByValue(sortChildState.value);
                  setSortOrder(sortChildState.order);
                }}
              >
                Apply Filters
              </button>
              <span
                className="text-blue-500 hover:underline text-xs cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedFilters(initializeFiltersArray());
                  setFilters(initializeFiltersArray());
                }}
              >
                <ReloadIcon className="inline" /> Reset Filters
              </span>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};

export default FilterTable;
