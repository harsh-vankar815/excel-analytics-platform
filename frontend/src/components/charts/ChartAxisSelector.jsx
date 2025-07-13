import { useState, useEffect } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';

const ChartAxisSelector = ({ 
  columns = [], 
  selectedColumns, 
  onSelectColumns, 
  is3D = false,
  numericColumnsOnly = false 
}) => {
  const [filteredColumns, setFilteredColumns] = useState([]);

  useEffect(() => {
    // Only filter columns if explicitly required for 3D charts or specific chart types
    // For most 2D charts, we want to allow string columns
    if (numericColumnsOnly && is3D) {
      // Filter numeric columns by checking if the sample contains a number
      setFilteredColumns(columns.filter(column => {
        // Make sure column has a sample property
        if (column.sample === undefined || column.sample === null) {
          return false;
        }
        
        // Try to convert to number and check if it's valid
        const num = Number(column.sample);
        return !isNaN(num) && isFinite(num);
      }));
    } else {
      // For 2D charts or when numeric columns are not required, show all columns
      setFilteredColumns(columns);
    }
  }, [columns, numericColumnsOnly, is3D]);

  // Handle X Axis selection
  const handleXAxisChange = (column) => {
    onSelectColumns({
      ...selectedColumns,
      x: column.name
    });
  };

  // Handle Y Axis selection (can be multiple for 2D charts)
  const handleYAxisChange = (columns) => {
    onSelectColumns({
      ...selectedColumns,
      y: Array.isArray(columns) ? columns.map(col => col.name) : [columns.name]
    });
  };

  // Handle Z Axis selection (only for 3D)
  const handleZAxisChange = (column) => {
    if (is3D) {
      onSelectColumns({
        ...selectedColumns,
        z: column.name
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* X Axis Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          X Axis
        </label>
        <Listbox value={filteredColumns.find(col => col.name === selectedColumns.x)} onChange={handleXAxisChange}>
          {({ open }) => (
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <span className="block truncate">
                  {selectedColumns.x ? selectedColumns.x : 'Select X Axis'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredColumns.map((column) => (
                    <Listbox.Option
                      key={column.name}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' : 
                                  'text-gray-900 dark:text-gray-100'
                        }`
                      }
                      value={column}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {column.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          )}
        </Listbox>
      </div>

      {/* Y Axis Selector (multiple select for non-3D) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Y Axis {!is3D && '(Choose up to 3)'}
        </label>
        <Listbox 
          value={is3D 
            ? filteredColumns.find(col => col.name === (selectedColumns.y?.[0] || '')) 
            : filteredColumns.filter(col => selectedColumns.y?.includes(col.name))
          } 
          onChange={handleYAxisChange}
          multiple={!is3D}
        >
          {({ open }) => (
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <span className="block truncate">
                  {is3D 
                    ? (selectedColumns.y?.[0] || 'Select Y Axis')
                    : selectedColumns.y?.length 
                      ? selectedColumns.y.join(', ') 
                      : 'Select Y Axes'
                  }
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredColumns.map((column) => (
                    <Listbox.Option
                      key={column.name}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' : 
                                  'text-gray-900 dark:text-gray-100'
                        }`
                      }
                      value={column}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {column.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          )}
        </Listbox>
      </div>

      {/* Z Axis Selector (only for 3D) */}
      {is3D && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Z Axis {is3D === 'bubble' && '(Size)'}
          </label>
          <Listbox 
            value={filteredColumns.find(col => col.name === selectedColumns.z)} 
            onChange={handleZAxisChange}
          >
            {({ open }) => (
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <span className="block truncate">
                    {selectedColumns.z ? selectedColumns.z : 'Select Z Axis'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                
                <Transition
                  show={open}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredColumns.map((column) => (
                      <Listbox.Option
                        key={column.name}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' : 
                                    'text-gray-900 dark:text-gray-100'
                          }`
                        }
                        value={column}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {column.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            )}
          </Listbox>
        </div>
      )}
    </div>
  );
};

export default ChartAxisSelector; 