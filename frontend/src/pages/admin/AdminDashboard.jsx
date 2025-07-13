import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../../redux/admin/adminSlice';
import Spinner from '../../components/ui/Spinner';
import { useTheme } from '../../contexts/ThemeContext';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);
  const [timeRange, setTimeRange] = useState('week');
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    dispatch(fetchAdminStats(timeRange));
  }, [dispatch, timeRange]);

  // Removed debug logging for activity chart data

  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  // Memoize progress bar colors
  const progressBarColors = useMemo(() => ({
    user: {
      bg: theme === 'dark' ? '#374151' : '#e5e7eb',
      fill: theme === 'dark' ? '#60a5fa' : '#3b82f6'
    },
    file: {
      bg: theme === 'dark' ? '#374151' : '#e5e7eb',
      fill: theme === 'dark' ? '#34d399' : '#10b981'
    },
    active: {
      bg: theme === 'dark' ? '#374151' : '#e5e7eb',
      fill: theme === 'dark' ? '#fbbf24' : '#d97706'
    },
    chart: {
      bg: theme === 'dark' ? '#374151' : '#e5e7eb',
      fill: theme === 'dark' ? '#a78bfa' : '#8b5cf6'
    }
  }), [theme]);

  // Memoize link button styles
  const getLinkButtonStyle = useCallback((type) => {
    switch (type) {
      case 'user':
        return {
          backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
          color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          hoverClass: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
        };
      case 'file':
        return {
          backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          color: theme === 'dark' ? '#34d399' : '#10b981',
          hoverClass: 'hover:bg-green-100 dark:hover:bg-green-900/30'
        };
      case 'active':
        return {
          backgroundColor: theme === 'dark' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(217, 119, 6, 0.1)',
          color: theme === 'dark' ? '#fbbf24' : '#d97706',
          hoverClass: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
        };
      case 'chart':
        return {
          backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
          color: theme === 'dark' ? '#a78bfa' : '#8b5cf6',
          hoverClass: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
        };
      default:
        return {
          backgroundColor: theme === 'dark' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          hoverClass: 'hover:bg-gray-100 dark:hover:bg-gray-700'
        };
    }
  }, [theme]);

  // Memoize activity badge styles
  const getActivityBadgeStyle = useCallback((action) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600">Error loading admin data</h2>
        <p style={{ color: styles.textColor }} className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex justify-end">
        <div style={{ 
          backgroundColor: styles.cardBackground,
          boxShadow: `0 1px 2px ${styles.shadowColor}`,
          padding: '10px 20px',
        }} className="gap-4 inline-flex px-4 items-center rounded-md">
          <button
            onClick={() => handleTimeRangeChange('week')}
            style={{
              backgroundColor: timeRange === 'week' ? styles.buttonPrimaryBackground : 'transparent',
              color: timeRange === 'week' ? styles.buttonPrimaryText : styles.secondaryColor,
              padding: '3px 7px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            className="px-4 py-2 text-sm font-medium rounded-l-md transition-colors"
          >
            Week
          </button>
          <button
            onClick={() => handleTimeRangeChange('month')}
            style={{
              backgroundColor: timeRange === 'month' ? styles.buttonPrimaryBackground : 'transparent',
              color: timeRange === 'month' ? styles.buttonPrimaryText : styles.secondaryColor,
              padding: '3px 7px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            className="px-4 py-2 text-sm font-medium transition-colors"
          >
            Month
          </button>
          <button
            onClick={() => handleTimeRangeChange('year')}
            style={{
              backgroundColor: timeRange === 'year' ? styles.buttonPrimaryBackground : 'transparent',
              color: timeRange === 'year' ? styles.buttonPrimaryText : styles.secondaryColor,
              padding: '3px 7px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            className="px-4 py-2 text-sm font-medium transition-colors"
          >
            Year
          </button>
          <button
            onClick={() => handleTimeRangeChange('all')}
            style={{
              backgroundColor: timeRange === 'all' ? styles.buttonPrimaryBackground : 'transparent',
              color: timeRange === 'all' ? styles.buttonPrimaryText : styles.secondaryColor,
              padding: '3px 7px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            className="px-4 py-2 text-sm font-medium rounded-r-md transition-colors"
          >
            All Time
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div style={{
          backgroundColor: styles.cardBackground,
          boxShadow: `0 1px 3px ${styles.shadowColor}`
        }} className="rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 style={{ color: styles.secondaryColor }} className="text-sm font-medium">Total Users</h3>
                <div className="flex items-baseline">
                  <p style={{ color: styles.textColor }} className="text-2xl font-bold">{stats?.userCount || 0}</p>
                  <span className={`ml-2 text-xs font-medium ${stats?.userGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats?.userGrowth >= 0 ? '+' : ''}{stats?.userGrowth || 0}%
                  </span>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: progressBarColors.user.bg }} className="mt-4 h-1 w-full rounded-full overflow-hidden">
              <div
                style={{ 
                  backgroundColor: progressBarColors.user.fill,
                  width: `${Math.min(Math.max((stats?.userCount || 0) / (stats?.maxUsers || 100) * 100, 5), 100)}%` 
                }}
                className="h-full rounded-full"
              ></div>
            </div>
          </div>
          <Link
            to="/admin/users"
            style={getLinkButtonStyle('user')}
            className={`block py-2 text-center text-sm font-medium ${getLinkButtonStyle('user').hoverClass} transition-colors`}
          >
            View All Users
          </Link>
        </div>

        {/* Files Card */}
        <div style={{
          backgroundColor: styles.cardBackground,
          boxShadow: `0 1px 3px ${styles.shadowColor}`
        }} className="rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-50 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 style={{ color: styles.secondaryColor }} className="text-sm font-medium">Files Uploaded</h3>
                <div className="flex items-baseline">
                  <p style={{ color: styles.textColor }} className="text-2xl font-bold">{stats?.fileCount || 0}</p>
                  <span className={`ml-2 text-xs font-medium ${stats?.fileGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats?.fileGrowth >= 0 ? '+' : ''}{stats?.fileGrowth || 0}%
                  </span>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: progressBarColors.file.bg }} className="mt-4 h-1 w-full rounded-full overflow-hidden">
              <div
                style={{ 
                  backgroundColor: progressBarColors.file.fill,
                  width: `${Math.min(Math.max((stats?.fileCount || 0) / (stats?.maxFiles || 100) * 100, 5), 100)}%` 
                }}
                className="h-full rounded-full"
              ></div>
            </div>
          </div>
          <Link
            to="/admin/files"
            style={getLinkButtonStyle('file')}
            className={`block py-2 text-center text-sm font-medium ${getLinkButtonStyle('file').hoverClass} transition-colors`}
          >
            View All Files
          </Link>
        </div>

        {/* Active Users Card */}
        <div style={{
          backgroundColor: styles.cardBackground,
          boxShadow: `0 1px 3px ${styles.shadowColor}`
        }} className="rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 style={{ color: styles.secondaryColor }} className="text-sm font-medium">Active Users</h3>
                <div className="flex items-baseline">
                  <p style={{ color: styles.textColor }} className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
                  <span className={`ml-2 text-xs font-medium ${stats?.activeGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats?.activeGrowth >= 0 ? '+' : ''}{stats?.activeGrowth || 0}%
                  </span>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: progressBarColors.active.bg }} className="mt-4 h-1 w-full rounded-full overflow-hidden">
              <div
                style={{ 
                  backgroundColor: progressBarColors.active.fill,
                  width: `${Math.min(Math.max((stats?.activeUsers || 0) / (stats?.userCount || 100) * 100, 5), 100)}%` 
                }}
                className="h-full rounded-full"
              ></div>
            </div>
          </div>
          <Link
            to="/admin/activity"
            style={getLinkButtonStyle('active')}
            className={`block py-2 text-center text-sm font-medium ${getLinkButtonStyle('active').hoverClass} transition-colors`}
          >
            View Activity
          </Link>
        </div>
      </div>

      {/* Charts and Activity Section - User Activity Chart removed */}

      {/* Recent Activity */}
      <div style={{
        backgroundColor: styles.cardBackground,
        boxShadow: `0 1px 3px ${styles.shadowColor}`,
        color: styles.textColor
      }} className="rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ color: styles.textColor }} className="text-lg font-medium">Recent Activity</h3>
          <Link 
            to="/admin/activity" 
            style={{ color: styles.primaryColor }}
            className="text-sm hover:underline"
          >
            View All Activity
          </Link>
        </div>

        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: styles.borderColor }}>
              <thead>
                <tr>
                  <th style={{ color: styles.secondaryColor }} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                  <th style={{ color: styles.secondaryColor }} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                  <th style={{ color: styles.secondaryColor }} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Resource</th>
                  <th style={{ color: styles.secondaryColor }} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: styles.borderColor }}>
                {stats.recentActivity.map((activity, index) => {
                  // Get appropriate style for the activity badge
                  let badgeStyle = getActivityBadgeStyle('default');
                  if (activity.action.includes('create')) {
                    badgeStyle = getActivityBadgeStyle('create');
                  } else if (activity.action.includes('update')) {
                    badgeStyle = getActivityBadgeStyle('update');
                  } else if (activity.action.includes('delete')) {
                    badgeStyle = getActivityBadgeStyle('delete');
                  }
                  
                  return (
                    <tr key={index} 
                      className="transition-colors"
                      style={{ backgroundColor: styles.cardBackground }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = styles.tableRowHoverBackground;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = styles.cardBackground;
                      }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            {activity.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p style={{ color: styles.textColor }} className="text-sm font-medium">{activity.user.name}</p>
                            <p style={{ color: styles.secondaryColor }} className="text-xs">{activity.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyle}`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p style={{ color: styles.textColor }} className="text-sm">{activity.resource.type}</p>
                        <p style={{ color: styles.secondaryColor }} className="text-xs truncate max-w-[100px]">{activity.resource.id}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: styles.secondaryColor }}>
                        {activity.timestamp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p style={{ color: styles.secondaryColor }}>No recent activity to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 