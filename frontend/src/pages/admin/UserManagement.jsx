import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchUsers, updateUserStatus, deleteUser } from '../../redux/admin/adminSlice';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../../components/ui/Avatar';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive, admin
  const [sortBy, setSortBy] = useState('name'); // name, email, status, role, created
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);
  
  // Handle sort column click
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if same column is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending order when switching columns
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  // Handle status toggle (active/inactive)
  const handleStatusToggle = async (userId, currentStatus) => {
    if (!userId || userId === 'undefined') {
      toast.error('Invalid user ID');
      return;
    }
    
    try {
      const result = await dispatch(
        updateUserStatus({
          userId,
          status: currentStatus === 'active' ? 'inactive' : 'active',
        })
      ).unwrap();
      
      // Check if the result indicates success
      if (result) {
        toast.success('User status updated successfully');
      } else {
        toast.error('Failed to update user status: No response from server');
      }
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(`Failed to update user status: ${err.message || 'Unknown error'}`);
    }
  };
  
  // Handle user selection for bulk actions
  const handleUserSelection = (userId) => {
    if (!userId || userId === 'undefined') {
      toast.error('Invalid user ID');
      return;
    }
    
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  // Handle select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      // Filter out any null or undefined IDs
      const validUserIds = currentUsers
        .map(user => user.id || user._id)
        .filter(id => id && id !== 'undefined');
      setSelectedUsers(validUserIds);
    }
  };
  
  // Handle bulk action
  const handleBulkAction = (action) => {
    // Filter out any invalid IDs
    const validSelectedUsers = selectedUsers.filter(id => id && id !== 'undefined');
    
    if (validSelectedUsers.length === 0) {
      toast.error('No valid users selected');
      return;
    }
    
    // Ask for confirmation before proceeding
    if (
      window.confirm(
        `Are you sure you want to ${
          action === 'activate'
            ? 'activate'
            : action === 'deactivate'
            ? 'deactivate'
            : 'delete'
        } ${validSelectedUsers.length} user(s)?`
      )
    ) {
      const promises = validSelectedUsers.map((userId) => {
        switch (action) {
          case 'activate':
            return dispatch(updateUserStatus({ userId, status: 'active' }));
          case 'deactivate':
            return dispatch(updateUserStatus({ userId, status: 'inactive' }));
          case 'delete':
            return dispatch(deleteUser(userId));
          default:
            return null;
        }
      });

      Promise.all(promises)
        .then(() => {
          toast.success(
            `Successfully ${
              action === 'activate'
                ? 'activated'
                : action === 'deactivate'
                ? 'deactivated'
                : 'deleted'
            } ${validSelectedUsers.length} user(s)`
          );
          // Clear selection after bulk action
          setSelectedUsers([]);
          setBulkActionOpen(false);
        })
        .catch((error) => {
          toast.error(`Error performing bulk action: ${error.message}`);
        });
    }
  };
  
  // Filter and search users
  const filteredUsers = users
    ? users.filter((user) => {
        // Apply status filter
        if (filter === 'active' && user.status !== 'active') return false;
        if (filter === 'inactive' && user.status !== 'inactive') return false;
        if (filter === 'admin' && user.role !== 'admin') return false;
        
        // Apply search term
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      })
    : [];
  
  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let compareA, compareB;
    
    // Determine values to compare based on sort column
    switch (sortBy) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'email':
        compareA = a.email.toLowerCase();
        compareB = b.email.toLowerCase();
        break;
      case 'status':
        compareA = a.status;
        compareB = b.status;
        break;
      case 'role':
        compareA = a.role;
        compareB = b.role;
        break;
      case 'created':
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
        break;
      default:
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
    }
    
    // Perform comparison based on sort order
    if (sortOrder === 'asc') {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(sortedUsers.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }
  
  if (loading && !users) {
    return (
      <div className="flex h-[70vh] items-center justify-center" style={{ color: styles.primaryColor }}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" 
          style={{ 
            borderColor: styles.primaryColor, 
            borderTopColor: 'transparent' 
          }}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600" style={{ color: styles.dangerColor }}>Error loading users</h2>
        <p className="mt-2 text-gray-600" style={{ color: styles.secondaryColor }}>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="rounded-lg shadow-sm p-3 sm:p-4" style={{ backgroundColor: styles.cardBackground }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-grow max-w-md w-full">
            <input
              type="text"
              placeholder="Search users by name or email..."
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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                backgroundColor: styles.inputBackground,
                color: styles.textColor,
                borderColor: styles.borderColor
              }}
              className="rounded-md border px-3 sm:px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
              <option value="admin">Admins Only</option>
            </select>

            <Link
              to="/admin/register"
              style={{
                backgroundColor: styles.buttonPrimaryBackground,
                color: styles.buttonPrimaryText
              }}
              className="px-3 sm:px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-center w-full sm:w-auto"
            >
              Add New User
            </Link>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: styles.highlightBackground }}>
          <div style={{ color: styles.textColor }}>
            <span className="font-medium">{selectedUsers.length}</span> users selected
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setBulkActionOpen(!bulkActionOpen)}
                style={{
                  backgroundColor: styles.buttonSecondaryBackground,
                  color: styles.buttonSecondaryText,
                  borderColor: styles.borderColor
                }}
                className="flex items-center justify-between gap-2 w-full sm:w-auto px-3 sm:px-4 py-2 rounded-md border"
              >
                <span>Bulk Actions</span>
                <svg
                  className={`h-5 w-5 transform ${bulkActionOpen ? 'rotate-180' : ''} transition-transform`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {bulkActionOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10" style={{ backgroundColor: styles.dropdownBackground }}>
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      style={{ color: styles.textColor }}
                      role="menuitem"
                    >
                      Activate Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      style={{ color: styles.textColor }}
                      role="menuitem"
                    >
                      Deactivate Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      style={{ color: styles.dangerColor }}
                      role="menuitem"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedUsers([])}
              style={{
                backgroundColor: 'transparent',
                color: styles.textColor,
                borderColor: styles.borderColor
              }}
              className="px-3 sm:px-4 py-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: styles.cardBackground }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: styles.borderColor }}>
            <thead style={{ backgroundColor: styles.tableHeaderBackground }}>
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                  style={{ color: styles.secondaryColor }}
                >
                  <div className="flex items-center">
                    <span>Name</span>
                    {sortBy === 'name' && (
                      <svg
                        className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hidden sm:table-cell"
                  onClick={() => handleSort('email')}
                  style={{ color: styles.secondaryColor }}
                >
                  <div className="flex items-center">
                    <span>Email</span>
                    {sortBy === 'email' && (
                      <svg
                        className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                  style={{ color: styles.secondaryColor }}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {sortBy === 'status' && (
                      <svg
                        className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort('role')}
                  style={{ color: styles.secondaryColor }}
                >
                  <div className="flex items-center">
                    <span>Role</span>
                    {sortBy === 'role' && (
                      <svg
                        className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                  onClick={() => handleSort('created')}
                  style={{ color: styles.secondaryColor }}
                >
                  <div className="flex items-center">
                    <span>Joined</span>
                    {sortBy === 'created' && (
                      <svg
                        className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: styles.secondaryColor }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: styles.borderColor }}>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id || user._id} style={{ borderColor: styles.borderColor }}>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id || user._id)}
                          onChange={() => handleUserSelection(user.id || user._id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center" style={{ backgroundColor: styles.avatarBackground }}>
                          <span style={{ color: styles.textColor }} className="text-sm font-medium">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div style={{ color: styles.textColor }} className="text-sm font-medium">{user.name}</div>
                          <div style={{ color: styles.secondaryColor }} className="text-xs sm:hidden">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div style={{ color: styles.secondaryColor }} className="text-sm">{user.email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        style={{
                          backgroundColor: user.status === 'active'
                            ? theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(209, 250, 229, 1)'
                            : theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 1)',
                          color: user.status === 'active'
                            ? theme === 'dark' ? '#6ee7b7' : '#065f46'
                            : theme === 'dark' ? '#fca5a5' : '#991b1b'
                        }}
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div style={{ color: styles.secondaryColor }} className="text-sm">{user.role}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell" style={{ color: styles.secondaryColor }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/users/${user.id || user._id}`}
                          style={{
                            backgroundColor: styles.buttonSecondaryBackground,
                            color: styles.buttonSecondaryText
                          }}
                          className="px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleStatusToggle(user.id || user._id, user.status)}
                          style={{
                            backgroundColor: user.status === 'active' ? styles.dangerColor : styles.successColor,
                            color: '#ffffff'
                          }}
                          className="px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-3 sm:px-6 py-8 text-center text-sm"
                    style={{ color: styles.secondaryColor }}
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View for User Details */}
      <div className="sm:hidden space-y-4 mt-4">
        {currentUsers.map((user) => (
          <div 
            key={`mobile-${user.id || user._id}`} 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: styles.cardBackground,
              boxShadow: `0 1px 3px ${styles.shadowColor}`
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id || user._id)}
                  onChange={() => handleUserSelection(user.id || user._id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <Avatar 
                  name={user.name} 
                  size="sm"
                  className="mr-2"
                />
                <div>
                  <div style={{ color: styles.textColor }} className="text-sm font-medium">
                    {user.name}
                  </div>
                  <div style={{ color: styles.secondaryColor }} className="text-xs">
                    {user.email}
                  </div>
                </div>
              </div>
              <span
                style={{
                  backgroundColor: user.status === 'active'
                    ? theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(209, 250, 229, 1)'
                    : theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 1)',
                  color: user.status === 'active'
                    ? theme === 'dark' ? '#6ee7b7' : '#065f46'
                    : theme === 'dark' ? '#fca5a5' : '#991b1b'
                }}
                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {user.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-2">
              <div style={{ color: styles.textColor }} className="text-sm mb-1">
                <span className="font-medium">Role:</span> {user.role}
              </div>
              <div style={{ color: styles.secondaryColor }} className="text-xs mb-3">
                <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/admin/users/${user.id || user._id}`}
                  style={{
                    backgroundColor: styles.buttonSecondaryBackground,
                    color: styles.buttonSecondaryText
                  }}
                  className="px-3 py-1 rounded-md hover:opacity-80 transition-opacity text-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleStatusToggle(user.id || user._id, user.status)}
                  style={{
                    backgroundColor: user.status === 'active' ? styles.dangerColor : styles.successColor,
                    color: '#ffffff'
                  }}
                  className="px-3 py-1 rounded-md hover:opacity-80 transition-opacity text-sm"
                >
                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pageNumbers.length > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0" style={{ color: styles.secondaryColor }}>
            Showing {currentUsers.length} of {sortedUsers.length} users
          </div>
          <nav className="flex justify-center">
            <ul className="flex space-x-1">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
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
                <li key={number} className={number === currentPage ? 'hidden sm:block' : 'hidden sm:block'}>
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
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === pageNumbers.length}
                  style={{
                    backgroundColor: styles.buttonSecondaryBackground,
                    color: styles.buttonSecondaryText,
                    opacity: currentPage === pageNumbers.length ? 0.5 : 1,
                    cursor: currentPage === pageNumbers.length ? 'not-allowed' : 'pointer'
                  }}
                  className="px-3 py-1 rounded-md text-sm"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
          <div className="text-sm mt-2 sm:mt-0 sm:block">
            Page {currentPage} of {pageNumbers.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 