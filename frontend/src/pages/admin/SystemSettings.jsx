import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchSystemSettings, updateSystemSettings } from '../../redux/admin/adminSlice';
import { useTheme } from '../../contexts/ThemeContext';

const SystemSettings = () => {
  const dispatch = useDispatch();
  const { systemSettings, loading, error } = useSelector((state) => state.admin);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  const [formData, setFormData] = useState({
    defaultStorageLimit: 500,
    defaultFileLimit: 50,
    defaultChartLimit: 100,
    contentModerationEnabled: true,
    autoApproveUploads: false,
    fileUploadSizeLimit: 10,
    allowedFileExtensions: ['.xlsx', '.xls', '.csv'],
    maintenanceMode: false
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  
  // Fetch settings on component mount
  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);
  
  // Update local form data when settings are loaded
  useEffect(() => {
    if (systemSettings) {
      setFormData(systemSettings);
    }
  }, [systemSettings]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? Number(value) : value
    }));
    
    setHasChanges(true);
  };

  const handleExtensionChange = (e) => {
    const value = e.target.value;
    const extensionsArray = value.split(',').map(ext => ext.trim()).filter(Boolean);
    
    setFormData(prev => ({
      ...prev,
      allowedFileExtensions: extensionsArray
    }));
    
    setHasChanges(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(updateSystemSettings(formData)).unwrap();
      toast.success('System settings updated successfully');
      setHasChanges(false);
    } catch (err) {
      toast.error('Failed to update system settings');
    }
  };
  
  if (loading && !systemSettings) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" style={{ 
          borderColor: styles.primaryColor, 
          borderTopColor: 'transparent' 
        }}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600" style={{ color: styles.dangerColor }}>Error loading system settings</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400" style={{ color: styles.secondaryColor }}>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4" style={{ backgroundColor: styles.cardBackground }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ color: styles.textColor }}>System Settings</h1>
          
          <button
            type="submit"
            form="settings-form"
            disabled={!hasChanges || loading}
            className={`rounded-md px-4 py-2 text-white ${
              !hasChanges || loading 
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 transition-colors'
            }`}
            style={{ 
              backgroundColor: !hasChanges || loading 
                ? styles.secondaryColor 
                : styles.buttonPrimaryBackground,
              color: styles.buttonPrimaryText,
              opacity: !hasChanges || loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" style={{ 
        backgroundColor: styles.cardBackground,
        boxShadow: `0 1px 3px ${styles.shadowColor}`
      }}>
        <form id="settings-form" onSubmit={handleSubmit} className="p-6">
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6" style={{ borderColor: styles.borderColor }}>
            <h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200" style={{ color: styles.textColor }}>User Limits</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400" style={{ color: styles.secondaryColor }}>
              These settings define the default limits for new users. You can override these limits for individual users.
            </p>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" style={{ color: styles.textColor }}>
                  Default Storage Limit (MB)
                </label>
                <input
                  type="number"
                  name="defaultStorageLimit"
                  value={formData.defaultStorageLimit}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: styles.inputBackground,
                    color: styles.textColor,
                    borderColor: styles.borderColor
                  }}
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" style={{ color: styles.textColor }}>
                  Default File Limit
                </label>
                <input
                  type="number"
                  name="defaultFileLimit"
                  value={formData.defaultFileLimit}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: styles.inputBackground,
                    color: styles.textColor,
                    borderColor: styles.borderColor
                  }}
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" style={{ color: styles.textColor }}>
                  Default Chart Limit
                </label>
                <input
                  type="number"
                  name="defaultChartLimit"
                  value={formData.defaultChartLimit}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: styles.inputBackground,
                    color: styles.textColor,
                    borderColor: styles.borderColor
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6" style={{ borderColor: styles.borderColor }}>
            <h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200" style={{ color: styles.textColor }}>Content Moderation</h2>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="contentModerationEnabled"
                name="contentModerationEnabled"
                checked={formData.contentModerationEnabled}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                style={{ 
                  borderColor: styles.borderColor,
                  accentColor: styles.primaryColor
                }}
              />
              <label htmlFor="contentModerationEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300" style={{ color: styles.textColor }}>
                Enable content moderation
              </label>
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="autoApproveUploads"
                name="autoApproveUploads"
                checked={formData.autoApproveUploads}
                onChange={handleChange}
                disabled={!formData.contentModerationEnabled}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                style={{ 
                  borderColor: styles.borderColor,
                  accentColor: styles.primaryColor
                }}
              />
              <label 
                htmlFor="autoApproveUploads" 
                className={`ml-2 block text-sm ${
                  formData.contentModerationEnabled 
                    ? 'text-gray-700 dark:text-gray-300' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                style={{ 
                  color: formData.contentModerationEnabled 
                    ? styles.textColor 
                    : styles.secondaryColor,
                  opacity: formData.contentModerationEnabled ? 1 : 0.6
                }}
              >
                Auto-approve uploads (skip moderation queue)
              </label>
            </div>
          </div>
          
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6" style={{ borderColor: styles.borderColor }}>
            <h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200" style={{ color: styles.textColor }}>File Upload Settings</h2>
            
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" style={{ color: styles.textColor }}>
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                name="fileUploadSizeLimit"
                value={formData.fileUploadSizeLimit}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full max-w-xs rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{ 
                  backgroundColor: styles.inputBackground,
                  color: styles.textColor,
                  borderColor: styles.borderColor
                }}
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" style={{ color: styles.textColor }}>
                Allowed File Extensions (comma-separated)
              </label>
              <input
                type="text"
                value={formData.allowedFileExtensions.join(', ')}
                onChange={handleExtensionChange}
                placeholder=".xlsx, .xls, .csv"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{ 
                  backgroundColor: styles.inputBackground,
                  color: styles.textColor,
                  borderColor: styles.borderColor
                }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400" style={{ color: styles.secondaryColor }}>
                Enter file extensions separated by commas, including the dot (e.g., .xlsx, .csv)
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200" style={{ color: styles.textColor }}>System Maintenance</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                style={{ 
                  borderColor: styles.borderColor,
                  accentColor: styles.primaryColor
                }}
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300" style={{ color: styles.textColor }}>
                Enable maintenance mode (only admins can access the system)
              </label>
            </div>
            
            {formData.maintenanceMode && (
              <div className="mt-4 rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4" style={{
                backgroundColor: theme === 'light' ? '#fefce8' : 'rgba(202, 138, 4, 0.15)',
                borderColor: theme === 'light' ? '#fef08a' : 'rgba(234, 179, 8, 0.3)'
              }}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg 
                      className="h-5 w-5 text-yellow-400 dark:text-yellow-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      style={{ color: theme === 'light' ? '#facc15' : '#fde047' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300" style={{ 
                      color: theme === 'light' ? '#854d0e' : '#fef08a' 
                    }}>Warning</h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200" style={{
                      color: theme === 'light' ? '#a16207' : '#fef9c3'
                    }}>
                      <p>
                        Enabling maintenance mode will prevent all non-admin users from accessing the platform.
                        Make sure to notify your users before enabling this option.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings; 