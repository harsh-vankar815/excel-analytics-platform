import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFiles, deleteFile } from '../redux/file/fileSlice';
import Spinner from '../components/ui/Spinner';
import { useTheme } from '../contexts/ThemeContext';

const Files = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const { files, isLoading, error } = useSelector(state => state.file);

  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  const handleDeleteFile = useCallback(async (id) => {
    try {
      await dispatch(deleteFile(id)).unwrap();
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

  const sortedFiles = useMemo(() => {
    if (!files) return [];

    const filteredFiles = searchTerm
      ? files.filter(file =>
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()))
      : [...files];

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
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [files, searchTerm, sortBy, sortOrder]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 style={{ color: styles.textColor }} className="text-2xl font-bold">My Files</h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          <Link
            to="/app/upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center whitespace-nowrap"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload File
          </Link>
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

      {files && files.length === 0 ? (
        <div style={{
          backgroundColor: styles.cardBackground,
          color: styles.textColor,
          boxShadow: `0 1px 3px ${styles.shadowColor}`
        }} className="rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 style={{ color: styles.textColor }} className="text-lg font-medium mb-1">No files yet</h3>
          <p style={{ color: styles.secondaryColor }} className="mb-4">Upload your first Excel file to get started</p>
          <Link
            to="/app/upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload File
          </Link>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: styles.cardBackground,
            color: styles.textColor,
            boxShadow: `0 1px 3px ${styles.shadowColor}`
          }} className="rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full" style={{
                borderColor: styles.borderColor
              }}>
                <thead style={{
                  backgroundColor: styles.tableHeaderBackground
                }}>
                  <tr>
                    <th
                      scope="col"
                      style={{ color: styles.secondaryColor }}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
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
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
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
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
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
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
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
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{
                  backgroundColor: styles.cardBackground,
                  color: styles.textColor,
                  borderColor: styles.borderColor
                }} className="divide-y" >
                  {sortedFiles.map((file) => (
                    <tr
                      key={file._id}
                      className="transition-colors"
                      style={{ backgroundColor: styles.cardBackground }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = styles.tableRowHoverBackground;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = styles.cardBackground;
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div style={{
                            backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                          }} className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center">
                            <svg style={{
                              color: theme === 'dark' ? '#34d399' : '#10b981'
                            }} className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div style={{
                              color: styles.textColor
                            }} className="text-sm font-medium">
                              {file.originalName}
                            </div>
                            <div style={{
                              color: styles.secondaryColor
                            }} className="text-sm">
                              {file.sheets?.length || 0} sheets
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{
                        color: styles.secondaryColor
                      }} className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{
                        color: styles.secondaryColor
                      }} className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatFileSize(file.size)}
                      </td>
                      <td style={{
                        color: styles.secondaryColor
                      }} className="px-6 py-4 whitespace-nowrap text-sm">
                        {file.viewCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link
                            to={`/app/files/${file._id}`}
                            style={{ color: styles.primaryColor }}
                            className="hover:text-blue-900 dark:hover:text-blue-300"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = theme === 'dark' ? '#93c5fd' : '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = styles.primaryColor;
                            }}
                          >
                            View
                          </Link>
                          <Link
                            to={`/app/charts/create/${file._id}`}
                            style={{ color: styles.successColor }}
                            className="hover:text-green-900 dark:hover:text-green-300"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = theme === 'dark' ? '#6ee7b7' : '#059669';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = styles.successColor;
                            }}
                          >
                            Create Chart
                          </Link>
                          <button
                            onClick={() => openDeleteModal(file)}
                            style={{ color: styles.dangerColor }}
                            className="hover:text-red-900 dark:hover:text-red-300"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = theme === 'dark' ? '#fca5a5' : '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = styles.dangerColor;
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile view - Card layout */}
          <div className="block md:hidden">
            <div className="grid grid-cols-1 gap-4">
              {sortedFiles.map((file) => (
                <div
                  key={file._id}
                  style={{
                    backgroundColor: styles.cardBackground,
                    color: styles.textColor,
                    borderColor: styles.borderColor
                  }}
                  className="rounded-lg shadow p-4"
                >
                  <div className="flex items-center mb-3">
                    <div style={{
                      backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                    }} className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center">
                      <svg style={{
                        color: theme === 'dark' ? '#34d399' : '#10b981'
                      }} className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 style={{ color: styles.textColor }} className="text-sm font-medium">{file.originalName}</h3>
                      <p style={{ color: styles.secondaryColor }} className="text-xs">
                        {new Date(file.createdAt).toLocaleDateString()} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div style={{ borderColor: styles.borderColor }} className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span style={{ color: styles.secondaryColor }} className="text-xs">{file.viewCount || 0} views</span>
                    <div className="flex space-x-3">
                      <Link
                        to={`/app/files/${file._id}`}
                        style={{ color: styles.primaryColor }}
                        className="text-sm hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        to={`/app/charts/create/${file._id}`}
                        style={{ color: styles.successColor }}
                        className="text-sm hover:underline"
                      >
                        Create Chart
                      </Link>
                      <button
                        onClick={() => openDeleteModal(file)}
                        style={{ color: styles.dangerColor }}
                        className="text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div style={{
            backgroundColor: styles.modalBackground,
            color: styles.textColor,
            position: 'relative',
            margin: 'auto',
            maxWidth: '28rem',
            width: '100%'
          }} className="rounded-lg p-6">
            <h3 style={{ color: styles.textColor }} className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p style={{ color: styles.secondaryColor }} className="mb-6">
              Are you sure you want to delete "{fileToDelete.originalName}"? This action cannot be undone and will also delete all associated charts.
            </p>
            <div className="flex justify-end space-x-4">
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
                className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(fileToDelete._id)}
                style={{
                  backgroundColor: styles.dangerColor,
                  color: '#ffffff'
                }}
                className="px-4 py-2 rounded-md hover:bg-red-700"
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

export default Files;