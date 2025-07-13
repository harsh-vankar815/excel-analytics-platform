import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateProfile } from '../redux/auth/authSlice';
import { UserIcon, EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const [formData, setFormData] = useState({
    name: '', 
    email: '',
    bio: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    dispatch(updateProfile({ 
      name: formData.name, 
      email: formData.email,
      bio: formData.bio
    }))
      .unwrap()
      .then(() => {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      })
      .catch((error) => {
        toast.error('Failed to update profile');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div style={{
        backgroundColor: styles.cardBackground,
        color: styles.textColor,
        boxShadow: `0 1px 3px ${styles.shadowColor}`
      }} className="rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-blue-100">{user?.email}</p>
              <p className="text-blue-100 mt-2">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" style={{ color: styles.textColor }} className="block text-sm font-medium mb-1">
                Full Name
              </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  backgroundColor: styles.inputBackground,
                  color: styles.textColor,
                  borderColor: styles.borderColor
                }}
                className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                    required
                  />
                </div>
            </div>
            
            <div>
                <label htmlFor="email" style={{ color: styles.textColor }} className="block text-sm font-medium mb-1">
                Email Address
              </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  backgroundColor: styles.inputBackground,
                  color: styles.textColor,
                  borderColor: styles.borderColor
                }}
                className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your email"
                    required
                  />
                </div>
            </div>
            
            <div>
                <label htmlFor="bio" style={{ color: styles.textColor }} className="block text-sm font-medium mb-1">
                  Bio
              </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                onChange={handleChange}
                  rows="4"
                  style={{
                    backgroundColor: styles.inputBackground,
                    color: styles.textColor,
                    borderColor: styles.borderColor
                  }}
                  className="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself"
                ></textarea>
            </div>
            
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  style={{
                    backgroundColor: styles.buttonSecondaryBackground,
                    color: styles.buttonSecondaryText,
                    borderColor: styles.borderColor
                  }}
                  className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              <button
                type="submit"
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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
              </button>
            </div>
          </form>
          ) : (
            <div className="space-y-6">
              <div style={{ borderColor: styles.borderColor }} className="border-b pb-5">
                <h3 style={{ color: styles.textColor }} className="text-lg font-medium">Profile Information</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p style={{ color: styles.secondaryColor }} className="text-sm font-medium">Name</p>
                    <p style={{ color: styles.textColor }} className="mt-1 text-sm">{user?.name}</p>
                  </div>
                  <div>
                    <p style={{ color: styles.secondaryColor }} className="text-sm font-medium">Email</p>
                    <p style={{ color: styles.textColor }} className="mt-1 text-sm">{user?.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p style={{ color: styles.secondaryColor }} className="text-sm font-medium">Bio</p>
                    <p style={{ color: styles.textColor }} className="mt-1 text-sm">{user?.bio || 'No bio provided.'}</p>
                  </div>
                </div>
              </div>
              
              <div style={{ borderColor: styles.borderColor }} className="border-b pb-5">
                <h3 style={{ color: styles.textColor }} className="text-lg font-medium">Account Information</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p style={{ color: styles.secondaryColor }} className="text-sm font-medium">Account Type</p>
                    <p style={{ color: styles.textColor }} className="mt-1 text-sm">{user?.role || 'Standard'}</p>
                  </div>
                  <div>
                    <p style={{ color: styles.secondaryColor }} className="text-sm font-medium">Member Since</p>
                    <p style={{ color: styles.textColor }} className="mt-1 text-sm">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    backgroundColor: styles.buttonPrimaryBackground,
                    color: styles.buttonPrimaryText,
                    borderRadius: '4px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease',
                    cursor: 'pointer'
                  }}
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center whitespace-nowrap"
                >
                  Edit Profile
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 