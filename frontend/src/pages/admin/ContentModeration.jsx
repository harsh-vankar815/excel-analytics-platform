import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  fetchContent, 
  updateContentStatus, 
  deleteContent 
} from '../../redux/admin/adminSlice';

const ContentModeration = () => {
  const dispatch = useDispatch();
  const { content, contentTotalCount, loading, error } = useSelector((state) => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [contentFilter, setContentFilter] = useState('all'); // all, files, charts
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, flagged, deleted
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedContent, setSelectedContent] = useState([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  // Handle sort column click
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Fetch content on mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      contentType: contentFilter !== 'all' ? contentFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sortBy,
      sortOrder
    };
    
    dispatch(fetchContent(params));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, contentFilter, statusFilter, sortBy, sortOrder]);

  // Handle content selection for bulk actions
  const handleContentSelection = (contentId) => {
    if (selectedContent.includes(contentId)) {
      setSelectedContent(selectedContent.filter(id => id !== contentId));
    } else {
      setSelectedContent([...selectedContent, contentId]);
    }
  };

  // Handle select all content
  const handleSelectAll = () => {
    if (selectedContent.length === content.length) {
      setSelectedContent([]);
    } else {
      setSelectedContent(content.map(item => item._id));
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action) => {
    if (selectedContent.length === 0) {
      toast.warning('No content selected');
      return;
    }

    try {
      switch (action) {
        case 'approve':
          await Promise.all(
            selectedContent.map(id => dispatch(updateContentStatus({ contentId: id, status: 'active' })))
          );
          toast.success('Content approved successfully');
          break;
        case 'flag':
          await Promise.all(
            selectedContent.map(id => dispatch(updateContentStatus({ contentId: id, status: 'flagged' })))
          );
          toast.success('Content flagged successfully');
          break;
        case 'delete':
          await Promise.all(
            selectedContent.map(id => dispatch(deleteContent(id)))
          );
          toast.success('Content deleted successfully');
          break;
        default:
          break;
      }
      setSelectedContent([]);
      setBulkActionOpen(false);
    } catch (err) {
      toast.error('Failed to perform bulk action');
    }
  };

  // Generate page numbers
  const pageNumbers = [];
  const totalPages = Math.ceil(contentTotalCount / itemsPerPage);
  
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading && !content.length) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600">Error loading content</h2>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
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
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Content</option>
              <option value="files">Files Only</option>
              <option value="charts">Charts Only</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content count and bulk actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
          Showing <span className="font-semibold">{content.length}</span> of{" "}
          <span className="font-semibold">{contentTotalCount}</span> items
          {(contentFilter !== 'all' || statusFilter !== 'all') && (
            <span> (filtered)</span>
          )}
        </div>
        
        {selectedContent.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setBulkActionOpen(!bulkActionOpen)}
              className="flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Bulk Actions ({selectedContent.length})
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={bulkActionOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </button>
            
            {bulkActionOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Approve Content
                  </button>
                  <button
                    onClick={() => handleBulkAction('flag')}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Flag Content
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Delete Content
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      checked={selectedContent.length === content.length && content.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    <span>Content</span>
                    {sortBy === 'title' && (
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  onClick={() => handleSort('contentType')}
                >
                  <div className="flex items-center">
                    <span>Type</span>
                    {sortBy === 'contentType' && (
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  onClick={() => handleSort('user')}
                >
                  <div className="flex items-center">
                    <span>Created By</span>
                    {sortBy === 'user' && (
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    <span>Created</span>
                    {sortBy === 'createdAt' && (
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {sortBy === 'status' && (
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {content.length > 0 ? (
                content.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        checked={selectedContent.includes(item._id)}
                        onChange={() => handleContentSelection(item._id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 flex-shrink-0 rounded-lg ${
                          item.contentType === 'file'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        } flex items-center justify-center`}>
                          {item.contentType === 'file' ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.contentType === 'file' ? item.fileName : item.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.contentType === 'file' ? 
                              `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : 
                              `${item.type} chart`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.contentType === 'file' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {item.contentType === 'file' ? 'Excel File' : 'Chart'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.contentType === 'file' ? 
                          item.uploadedBy?.name : 
                          item.createdBy?.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.contentType === 'file' ? 
                          item.uploadedBy?.email : 
                          item.createdBy?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : item.status === 'flagged'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleBulkAction('approve', [item._id])}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleBulkAction('flag', [item._id])}
                          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                        >
                          Flag
                        </button>
                        <button
                          onClick={() => handleBulkAction('delete', [item._id])}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No content found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageNumbers.length > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, contentTotalCount)}
            </span>{' '}
            of <span className="font-medium">{contentTotalCount}</span> results
          </div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md border px-2 py-2 text-sm font-medium ${
                currentPage === 1
                  ? 'cursor-not-allowed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                  currentPage === number
                    ? 'z-10 border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md border px-2 py-2 text-sm font-medium ${
                currentPage === totalPages
                  ? 'cursor-not-allowed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ContentModeration; 