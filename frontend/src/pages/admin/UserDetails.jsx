import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchUserById,
  fetchUserActivity,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from '../../redux/admin/adminSlice';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../../components/ui/Avatar';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const { selectedUser, userActivity, loading, error } = useSelector((state) => state.admin);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userStats, setUserStats] = useState({
    fileCount: 0,
    chartCount: 0,
    lastActive: null
  });

  useEffect(() => {
    if (id && id !== 'undefined') {
      dispatch(fetchUserById(id));
      dispatch(fetchUserActivity(id));
    } else {
      // If ID is undefined or 'undefined', redirect to the user management page
      toast.error('Invalid user ID provided');
      navigate('/admin/users');
    }
  }, [dispatch, id, navigate]);

  // Calculate user stats from activity and user data
  useEffect(() => {
    if (selectedUser) {
      // Set initial values with backend-provided counts
      const stats = {
        fileCount: selectedUser.fileCount || 0,
        chartCount: selectedUser.chartCount || 0,
        lastActive: selectedUser.lastActive || null
      };

      // Update lastActive from activity if available
      if (userActivity && userActivity.length > 0) {
        // Find most recent activity timestamp
        let mostRecentActivity = stats.lastActive;

        userActivity.forEach(activity => {
          // Track most recent activity timestamp
          if (!mostRecentActivity || new Date(activity.timestamp) > new Date(mostRecentActivity)) {
            mostRecentActivity = activity.timestamp;
          }
        });

        stats.lastActive = mostRecentActivity;
      }

      setUserStats(stats);
    }
  }, [selectedUser, userActivity]);

  const handleRoleToggle = async () => {
    if (!selectedUser) return;

    try {
      await dispatch(
        updateUserRole({
          userId: selectedUser._id,
          role: selectedUser.role === 'admin' ? 'user' : 'admin',
        })
      ).unwrap();

      toast.success('User role updated successfully');
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;

    try {
      await dispatch(
        updateUserStatus({
          userId: selectedUser._id,
          status: selectedUser.status === 'active' ? 'inactive' : 'active',
        })
      ).unwrap();

      toast.success('User status updated successfully');
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await dispatch(deleteUser(selectedUser._id)).unwrap();
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading && !selectedUser) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600">Error loading user</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 text-white"
        >
          Return to User Management
        </button>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">User not found</h2>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 text-white"
        >
          Return to User Management
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`bg-white rounded-lg shadow-sm p-4 ${theme === 'light' ? 'bg-white' : 'dark:bg-gray-800'}`} style={{ backgroundColor: styles.backgroundColor }}>
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'dark:text-white'}`} style={{ color: styles.textColor }}>User Details</h1>
          <button
            onClick={() => navigate('/admin/users')}
            className={`rounded-md transition-colors px-4 py-2 text-white ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'dark:bg-blue-600 dark:hover:bg-blue-700'}`}
            style={{
              backgroundColor: styles.buttonPrimaryBackground, color: styles.buttonPrimaryText, borderRadius: '4px',
              padding: '3px 7px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.3s ease',
              cursor: 'pointer'
            }}
          >
            Back to Users
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* User Profile Card */}
        <div className={`md:col-span-1 rounded-lg p-6 shadow-sm ${theme === 'light' ? 'bg-white' : 'dark:bg-gray-800'}`} style={{ backgroundColor: styles.backgroundColor }}>
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <Avatar name={selectedUser.name} size="lg" className="h-24 w-24" />
            </div>
            <h2 className={`mb-1 text-xl font-semibold ${theme === 'light' ? 'text-gray-900' : 'dark:text-white'}`} style={{ color: styles.textColor }}>{selectedUser.name || 'N/A'}</h2>
            <p className={`${theme === 'light' ? 'text-gray-600' : 'dark:text-gray-400'}`}>{selectedUser.email || 'No email'}</p>
            <div className="mt-4 flex w-full flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-500' : 'dark:text-gray-400'}`}>Role:</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${selectedUser.role === 'admin'
                      ? theme === 'light' ? 'bg-purple-100 text-purple-800' : 'dark:bg-purple-900/30 dark:text-purple-300'
                      : theme === 'light' ? 'bg-blue-100 text-blue-800' : 'dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                >
                  {selectedUser.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-500' : 'dark:text-gray-400'}`}>Status:</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${selectedUser.status === 'active'
                      ? theme === 'light' ? 'bg-green-100 text-green-800' : 'dark:bg-green-900/30 dark:text-green-300'
                      : theme === 'light' ? 'bg-red-100 text-red-800' : 'dark:bg-red-900/30 dark:text-red-300'
                    }`}
                >
                  {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-500' : 'dark:text-gray-400'}`}>Member Since:</span>
                <span className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'dark:text-gray-300'}`}>
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-6 border-t pt-4 ${theme === 'light' ? 'border-gray-200' : 'dark:border-gray-700'}`}>
            <h3 className={`mb-3 text-base font-medium ${theme === 'light' ? 'text-gray-800' : 'dark:text-gray-200'}`}>User Actions</h3>
            <div className={`rounded-lg overflow-hidden ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
              <button
                onClick={handleRoleToggle}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors border-b ${theme === 'light' ? 'text-gray-800 hover:bg-gray-200 border-gray-200' : 'text-white hover:bg-gray-800 border-gray-800'}`}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {selectedUser.role === 'admin'
                  ? 'Change to Standard User'
                  : 'Promote to Admin'}
              </button>

              <button
                onClick={handleStatusToggle}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors border-b ${theme === 'light' ? 'text-gray-800 hover:bg-gray-200 border-gray-200' : 'text-white hover:bg-gray-800 border-gray-800'}`}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${selectedUser.status === 'active' ? (theme === 'light' ? 'text-red-600' : 'text-red-400') : (theme === 'light' ? 'text-green-600' : 'text-green-400')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {selectedUser.status === 'active' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {selectedUser.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${theme === 'light' ? 'text-gray-800 hover:bg-gray-200' : 'text-white hover:bg-gray-800'}`}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* User Activity */}
          <div className={`rounded-lg p-6 shadow-sm ${theme === 'light' ? 'bg-white' : 'dark:bg-gray-800'}`} style={{ backgroundColor: styles.backgroundColor }}>
            <h3 className={`mb-4 text-lg font-medium ${theme === 'light' ? 'text-gray-800' : 'dark:text-gray-200'}`} style={{ color: styles.textColor }}>Activity Summary</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className={`rounded-md p-4 ${theme === 'light' ? 'bg-gray-50' : 'dark:bg-gray-700'}`}>
                <div className={`text-2xl font-semibold ${theme === 'light' ? 'text-blue-600' : 'dark:text-blue-400'}`}>
                  {userStats.fileCount}
                </div>
                <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'dark:text-gray-400'}`}>Files Uploaded</div>
              </div>
              <div className={`rounded-md p-4 ${theme === 'light' ? 'bg-gray-50' : 'dark:bg-gray-700'}`}>
                <div className={`text-2xl font-semibold ${theme === 'light' ? 'text-blue-600' : 'dark:text-blue-400'}`}>
                  {userStats.chartCount}
                </div>
                <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'dark:text-gray-400'}`}>Charts Created</div>
              </div>
              <div className={`rounded-md p-4 ${theme === 'light' ? 'bg-gray-50' : 'dark:bg-gray-700'}`}>
                <div className={`text-2xl font-semibold ${theme === 'light' ? 'text-blue-600' : 'dark:text-blue-400'}`}>
                  {userStats.lastActive
                    ? new Date(userStats.lastActive).toLocaleDateString()
                    : 'Never'
                  }
                </div>
                <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'dark:text-gray-400'}`}>Last Active</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`rounded-lg p-6 shadow-sm ${theme === 'light' ? 'bg-white' : 'dark:bg-gray-800'}`} style={{ backgroundColor: styles.backgroundColor }}>
            <h3 className={`mb-4 text-lg font-medium ${theme === 'light' ? 'text-gray-800' : 'dark:text-gray-200'}`} style={{ color: styles.textColor }}>Recent Activity</h3>

            {userActivity && userActivity.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {userActivity.map((activity, index) => (
                  <div key={index} className={`py-3 ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-gray-700'} transition-colors`}>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 mt-1 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                        {activity.action === 'UPLOAD_FILE' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        ) : activity.action === 'CREATE_CHART' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                          {activity.details}
                        </p>
                        <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`py-6 text-center ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4">No recent activity found</p>
              </div>
            )}
          </div>

          {/* Subscription Info */}
          {selectedUser.subscription && (
            <div className={`rounded-lg p-6 shadow-sm ${theme === 'light' ? 'bg-white' : 'dark:bg-gray-800'}`} style={{ backgroundColor: styles.backgroundColor }}>
              <h3 className={`mb-4 text-lg font-medium ${theme === 'light' ? 'text-gray-800' : 'dark:text-gray-200'}`} style={{ color: styles.textColor }}>Subscription</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Plan:</span>
                  <span className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{selectedUser.subscription.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Status:</span>
                  <span
                    className={`${selectedUser.subscription.status === 'active'
                        ? theme === 'light' ? 'text-green-600' : 'text-green-400'
                        : theme === 'light' ? 'text-red-600' : 'text-red-400'
                      }`}
                  >
                    {selectedUser.subscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Renewal:</span>
                  <span className={`${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {selectedUser.subscription.renewalDate
                      ? new Date(selectedUser.subscription.renewalDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={`absolute inset-0 ${theme === 'light' ? 'bg-gray-500 opacity-75' : 'bg-gray-900 opacity-75'}`}></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div
              className={`inline-block transform overflow-hidden rounded-lg text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}
              style={{ 
                backgroundColor: styles.backgroundColor,
                position: 'relative',
                margin: 'auto',
                maxWidth: '28rem',
                width: '100%'
              }}
            >
              <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${theme === 'light' ? 'bg-red-100' : 'bg-red-900/30'} sm:mx-0 sm:h-10 sm:w-10`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className={`text-lg font-medium leading-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`} style={{ color: styles.textColor }}>
                      Delete User Account
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Are you sure you want to delete this user account? All of their data will be permanently
                        removed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}>
                <button
                  type="button"
                  className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${theme === 'light' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-700 hover:bg-red-800'}`}
                  onClick={handleDeleteUser}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className={`mt-3 inline-flex w-full justify-center rounded-md border px-4 py-2 text-base font-medium shadow-sm focus:outline-none sm:mt-0 sm:w-auto sm:text-sm ${theme === 'light'
                      ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails; 