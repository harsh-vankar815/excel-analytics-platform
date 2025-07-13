import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActivityLogs } from '../../redux/admin/adminSlice';
import { useTheme } from '../../contexts/ThemeContext';

const ActivityLogs = () => {
  const dispatch = useDispatch();
  const { activityLogs, activityTotalCount, loading, error } = useSelector((state) => state.admin);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Action type options
  const actionTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'UPLOAD_FILE', label: 'File Upload' },
    { value: 'DELETE_FILE', label: 'File Delete' },
    { value: 'CREATE_CHART', label: 'Chart Creation' },
    { value: 'UPDATE_CHART', label: 'Chart Update' },
    { value: 'DELETE_CHART', label: 'Chart Delete' },
    { value: 'USER_UPDATE', label: 'User Update' },
    { value: 'SETTINGS_UPDATE', label: 'System Update' }
  ];
  
  // Debounced search function
  const debouncedSearch = useCallback(
    (value) => {
      const timer = setTimeout(() => {
        setSearchTerm(value);
        setCurrentPage(1);
      }, 500);
      
      return () => {
        clearTimeout(timer);
      };
    },
    []
  );
  
  // Handle search input change
  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInputValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);
  
  // Fetch activity logs on component mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage
    };

    // Only add defined parameters
    if (searchTerm) params.search = searchTerm;
    if (actionFilter && actionFilter !== 'all') params.action = actionFilter;
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    
    dispatch(fetchActivityLogs(params))
      .unwrap()
      .then(() => {
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      })
      .catch(error => {
        console.error('Failed to fetch activity logs:', error);
      });
  }, [dispatch, currentPage, itemsPerPage, searchTerm, actionFilter, dateRange, isInitialLoad]);
  
  // Change page
  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);
  
  // Handle date range changes
  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, []);
  
  // Handle filter changes
  const handleFilterChange = useCallback((e) => {
    setActionFilter(e.target.value);
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, []);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setActionFilter('all');
    setDateRange({ startDate: '', endDate: '' });
    setSearchTerm('');
    setSearchInputValue('');
    setCurrentPage(1);
  }, []);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(activityTotalCount / itemsPerPage) || 1;
  }, [activityTotalCount, itemsPerPage]);
  
  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const numbers = [];
    
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  }, [totalPages]);
  
  // Define action type badge styles based on theme
  const getActionBadgeStyle = useCallback((action) => {
    if (action === 'LOGIN' || action === 'LOGOUT') {
      return {
        backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(219, 234, 254, 1)',
        color: theme === 'dark' ? '#93c5fd' : '#1e40af'
      };
    } else if (action.includes('UPLOAD') || action.includes('CREATE')) {
      return {
        backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(209, 250, 229, 1)',
        color: theme === 'dark' ? '#6ee7b7' : '#065f46'
      };
    } else if (action.includes('DELETE')) {
      return {
        backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 1)',
        color: theme === 'dark' ? '#fca5a5' : '#991b1b'
      };
    } else {
      return {
        backgroundColor: theme === 'dark' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(243, 244, 246, 1)',
        color: theme === 'dark' ? '#d1d5db' : '#374151'
      };
    }
  }, [theme]);
  
  if (loading && isInitialLoad) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600">Error loading activity logs</h2>
        <p style={{ color: styles.textColor }} className="mt-2">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div style={{
        backgroundColor: styles.cardBackground,
        color: styles.textColor,
        boxShadow: `0 1px 3px ${styles.shadowColor}`
      }} className="rounded-lg shadow-sm p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-grow max-w-md w-full">
            <input
              type="text"
              placeholder="Search by user or activity..."
              value={searchInputValue}
              onChange={handleSearchInputChange}
              style={{
                backgroundColor: styles.inputBackground,
                color: styles.textColor,
                borderColor: styles.borderColor
              }}
              className="w-full rounded-md border pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={actionFilter}
              onChange={handleFilterChange}
              style={{
                backgroundColor: styles.inputBackground,
                color: styles.textColor,
                borderColor: styles.borderColor
              }}
              className="rounded-md border px-3 sm:px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
            >
              {actionTypes.map(action => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={resetFilters}
              style={{
                backgroundColor: styles.buttonPrimaryBackground,
                color: styles.buttonPrimaryText,
                borderRadius: '4px',
                padding: '3px 7px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.3s ease',
                cursor: 'pointer'
              }}
              className="px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Reset Filters
            </button>
          </div>
        </div>
      
        {/* Date Range Filters */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label style={{ color: styles.textColor }} className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              style={{
                backgroundColor: styles.inputBackground,
                color: styles.textColor,
                borderColor: styles.borderColor
              }}
              className="rounded-md border px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label style={{ color: styles.textColor }} className="block text-sm font-medium mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              style={{
                backgroundColor: styles.inputBackground,
                color: styles.textColor,
                borderColor: styles.borderColor
              }}
              className="rounded-md border px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>
        </div>
      </div>
        
      {/* Activity count */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div style={{ color: styles.secondaryColor }} className="mb-4 sm:mb-0">
          Showing <span className="font-semibold">{Math.min(activityLogs?.length || 0, itemsPerPage)}</span> of{" "}
          <span className="font-semibold">{activityTotalCount || 0}</span> activities
          {actionFilter !== 'all' && (
            <span> (filtered by {actionTypes.find(a => a.value === actionFilter)?.label})</span>
          )}
        </div>
      </div>
      
      {/* Activity Logs Table */}
      <div style={{
        backgroundColor: styles.cardBackground,
        color: styles.textColor,
        boxShadow: `0 1px 3px ${styles.shadowColor}`
      }} className="rounded-lg shadow-sm overflow-hidden">
        {loading && !isInitialLoad && (
          <div style={{
            backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)'
          }} className="absolute inset-0 flex justify-center items-center z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: styles.borderColor }}>
            <thead style={{ backgroundColor: styles.tableHeaderBackground }}>
              <tr>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Activity
                </th>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell"
                >
                  Details
                </th>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: styles.borderColor }}>
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <tr key={log._id} style={{ borderColor: styles.borderColor }}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3" style={{ backgroundColor: styles.avatarBackground }}>
                          <span style={{ color: styles.textColor }} className="text-sm font-medium">
                            {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'S'}
                          </span>
                        </div>
                        <div>
                          <div style={{ color: styles.textColor }} className="text-sm font-medium">
                            {log.user?.name || 'System'}
                          </div>
                          <div style={{ color: styles.secondaryColor }} className="text-xs">
                            {log.user?.email || 'system@example.com'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        style={getActionBadgeStyle(log.action)}
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-normal hidden sm:table-cell">
                      <div style={{ color: styles.textColor }} className="text-sm">
                        {log.details || 'No additional details'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm" style={{ color: styles.secondaryColor }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 sm:px-6 py-8 text-center text-sm"
                    style={{ color: styles.secondaryColor }}
                  >
                    No activity logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile View for Details */}
      {activityLogs.length > 0 && (
        <div className="sm:hidden space-y-4 mt-4">
          {activityLogs.map((log) => (
            <div 
              key={`mobile-${log._id}`} 
              className="p-4 rounded-lg"
              style={{
                backgroundColor: styles.cardBackground,
                boxShadow: `0 1px 3px ${styles.shadowColor}`
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2" style={{ backgroundColor: styles.avatarBackground }}>
                    <span style={{ color: styles.textColor }} className="text-sm font-medium">
                      {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'S'}
                    </span>
                  </div>
                  <div>
                    <div style={{ color: styles.textColor }} className="text-sm font-medium">
                      {log.user?.name || 'System'}
                    </div>
                    <div style={{ color: styles.secondaryColor }} className="text-xs">
                      {log.user?.email || 'system@example.com'}
                    </div>
                  </div>
                </div>
                <span
                  style={getActionBadgeStyle(log.action)}
                  className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {log.action}
                </span>
              </div>
              <div className="mt-2">
                <div style={{ color: styles.textColor }} className="text-sm mb-1">
                  <span className="font-medium">Details:</span> {log.details || 'No additional details'}
                </div>
                <div style={{ color: styles.secondaryColor }} className="text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm text-gray-500 mb-2 sm:mb-0" style={{ color: styles.secondaryColor }}>
          Showing {activityLogs.length} of {activityTotalCount} results
        </div>
        <nav className="flex justify-center">
          <ul className="flex space-x-1">
            <li>
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  backgroundColor: styles.buttonSecondaryBackground,
                  color: styles.buttonSecondaryText,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
                className="px-3 py-1 rounded-md text-sm"
              >
                Prev
              </button>
            </li>
            {pageNumbers.map((number) => (
              <li key={number} className={currentPage === number ? 'hidden sm:block' : 'hidden sm:block'}>
                <button
                  onClick={() => paginate(number)}
                  style={{
                    backgroundColor: currentPage === number ? styles.buttonPrimaryBackground : styles.buttonSecondaryBackground,
                    color: currentPage === number ? styles.buttonPrimaryText : styles.buttonSecondaryText
                  }}
                  className="px-3 py-1 rounded-md text-sm"
                >
                  {number}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  backgroundColor: styles.buttonSecondaryBackground,
                  color: styles.buttonSecondaryText,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
                className="px-3 py-1 rounded-md text-sm"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
        <div className="text-sm mt-2 sm:mt-0 sm:block">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs; 