import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, deleteContent } from '../../redux/admin/adminSlice';
import Spinner from '../../components/ui/Spinner';
import { useTheme } from '../../contexts/ThemeContext';

const FileManagement = () => {
  const dispatch = useDispatch();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const { content: files, loading: isLoading, error } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchContent({ contentType: 'files' }));
  }, [dispatch]);

  const handleDeleteFile = useCallback(async (id) => {
    try {
      await dispatch(deleteContent({ contentId: id, contentType: 'file' })).unwrap();
      setConfirmDelete(false);
      setFileToDelete(null);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }, [dispatch]);

  const openDeleteModal = useCallback((file) => {
    setFileToDelete(file);
    setConfirmDelete(true);
  }, []);

  const handleSort = useCallback((field) => {
    setSortBy(prevSortBy => {
      if (prevSortBy === field) {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
        return field;
      } else {
        setSortOrder('asc');
        return field;
      }
    });
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }, []);

  // Debounced search handler
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    // Use setTimeout to debounce the search
    const timeoutId = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Debounced user filter handler
  const handleUserFilterChange = useCallback((e) => {
    const value = e.target.value;
    // Use setTimeout to debounce the filter
    const timeoutId = setTimeout(() => {
      setFilterUser(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const sortedFiles = useMemo(() => {
    if (!files) return [];

    const filteredFiles = files.filter(file => {
      // Only include files, not charts
      if (file.contentType !== 'file') return false;

      const matchesSearch = searchTerm
        ? file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesUser = filterUser
        ? (file.uploadedBy?.name || '').toLowerCase().includes(filterUser.toLowerCase()) ||
          (file.uploadedBy?.email || '').toLowerCase().includes(filterUser.toLowerCase())
        : true;

      return matchesSearch && matchesUser;
    });

    return filteredFiles.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'originalName') {
        comparison = a.originalName.localeCompare(b.originalName);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      } else if (sortBy === 'viewCount') {
        comparison = a.viewCount - b.viewCount;
      } else if (sortBy === 'user') {
        comparison = (a.uploadedBy?.name || '').localeCompare(b.uploadedBy?.name || '');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [files, searchTerm, filterUser, sortBy, sortOrder]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 style={{
          color: styles.textColor
        }} className="text-2xl font-bold">File Management</h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search files..."
              defaultValue={searchTerm}
              onChange={handleSearchChange}
              style={{
                backgroundColor: styles.inputBackground,
                color: styles.textColor,
                borderColor: styles.borderColor
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="relative flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter by user..."
              defaultValue={filterUser}
              onChange={handleUserFilterChange}
              style={{
                backgroundColor: styles.inputBackground,
                color: styles.textColor,
                borderColor: styles.borderColor
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
          color: theme === 'dark' ? '#f87171' : '#b91c1c',
          borderColor: theme === 'dark' ? '#f87171' : '#ef4444'
        }} className="border-l-4 p-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div style={{
        backgroundColor: styles.cardBackground,
        color: styles.textColor,
        boxShadow: `0 1px 3px ${styles.shadowColor}`
      }} className="rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: styles.borderColor }}>
            <thead style={{ backgroundColor: styles.tableHeaderBackground }}>
              <tr>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('originalName')}
                >
                  <div className="flex items-center">
                    File Name
                    {sortBy === 'originalName' && (
                      <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hidden sm:table-cell"
                  onClick={() => handleSort('user')}
                >
                  <div className="flex items-center">
                    User
                    {sortBy === 'user' && (
                      <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Upload Date
                    {sortBy === 'createdAt' && (
                      <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort('size')}
                >
                  <div className="flex items-center">
                    Size
                    {sortBy === 'size' && (
                      <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                  onClick={() => handleSort('viewCount')}
                >
                  <div className="flex items-center">
                    Views
                    {sortBy === 'viewCount' && (
                      <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  style={{ color: styles.secondaryColor }}
                  className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: styles.borderColor }}>
              {sortedFiles.length > 0 ? (
                sortedFiles.map((file) => (
                  <tr key={file._id} style={{ borderColor: styles.borderColor }}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30 mr-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: styles.primaryColor }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-1">
                          <div className="text-sm font-medium" style={{ color: styles.textColor }}>
                            {file.originalName}
                          </div>
                          <div className="text-xs sm:hidden" style={{ color: styles.secondaryColor }}>
                            {file.uploadedBy?.name || 'Unknown User'}
                          </div>
                          <div className="text-xs sm:hidden" style={{ color: styles.secondaryColor }}>
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm" style={{ color: styles.secondaryColor }}>
                        {file.uploadedBy?.name || 'Unknown User'}
                      </div>
                      <div className="text-xs" style={{ color: styles.secondaryColor }}>
                        {file.uploadedBy?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell" style={{ color: styles.secondaryColor }}>
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell" style={{ color: styles.secondaryColor }}>
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell" style={{ color: styles.secondaryColor }}>
                      {file.viewCount || 0}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/files/${file._id}`}
                          style={{
                            backgroundColor: styles.buttonSecondaryBackground,
                            color: styles.buttonSecondaryText
                          }}
                          className="px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openDeleteModal(file)}
                          style={{
                            backgroundColor: styles.dangerColor,
                            color: '#ffffff',
                            borderRadius: '5px',
                            padding: '0 6px'
                          }}
                          className="px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-3 sm:px-6 py-8 text-center text-sm"
                    style={{ color: styles.secondaryColor }}
                  >
                    No files found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View for File Details */}
      <div className="sm:hidden space-y-4 mt-4">
        {sortedFiles.map((file) => (
          <div 
            key={`mobile-${file._id}`} 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: styles.cardBackground,
              boxShadow: `0 1px 3px ${styles.shadowColor}`
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30 mr-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: styles.primaryColor }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: styles.textColor }}>
                    {file.originalName}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div style={{ color: styles.secondaryColor }} className="text-sm mb-1">
                <span className="font-medium">User:</span> {file.uploadedBy?.name || 'Unknown User'}
              </div>
              <div style={{ color: styles.secondaryColor }} className="text-xs mb-1">
                <span className="font-medium">Size:</span> {formatFileSize(file.size)}
              </div>
              <div style={{ color: styles.secondaryColor }} className="text-xs mb-3">
                <span className="font-medium">Uploaded:</span> {new Date(file.createdAt).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/files/${file._id}`}
                  style={{
                    backgroundColor: styles.buttonSecondaryBackground,
                    color: styles.buttonSecondaryText
                  }}
                  className="px-3 py-1 rounded-md hover:opacity-80 transition-opacity text-sm"
                >
                  View File
                </Link>
                <button
                  onClick={() => openDeleteModal(file)}
                  style={{
                    backgroundColor: styles.dangerColor,
                    color: '#ffffff'
                  }}
                  className="px-3 py-1 rounded-md hover:opacity-80 transition-opacity text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 rounded-lg" style={{ backgroundColor: styles.cardBackground }}>
            <h3 className="text-lg font-medium mb-4" style={{ color: styles.textColor }}>Confirm Delete</h3>
            <p className="mb-4" style={{ color: styles.secondaryColor }}>
              Are you sure you want to delete the file "{fileToDelete.originalName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setFileToDelete(null);
                }}
                style={{
                  backgroundColor: styles.buttonSecondaryBackground,
                  color: styles.buttonSecondaryText,
                  borderColor: styles.borderColor
                }}
                className="px-4 py-2 rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(fileToDelete._id)}
                style={{
                  backgroundColor: styles.dangerColor,
                  color: '#ffffff'
                }}
                className="px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManagement; 